var sharejs = require('share').server,
    client = require('share').client,
    bodyParser = require('body-parser'),
    log4js = require('log4js'),

    db = require('./db'),
    store = require('./store');

var log = log4js.getLogger('sharejs');

var docs = {};

var modes = {
    'js': 'javascript',
    'cl': 'lisp',
    'pm': 'perl',
    'yml': 'yaml'
};

function startSaving(name) {
    var file = docs[name];
    file.saved = file.doc.version;
    file.idleCount = 0;
    if (!file.saver) {
        file.saver = setInterval(function() {
            if (file.doc.version>file.saved) {
                log.debug("Saving file "+file.file);
                var text;
                if (file.type === 'text') {
                    text = file.doc.snapshot;
                } else {
                    text = JSON.stringify(file.doc.get());
                }
                store.writeFile(file.file, text)
                .then(function () {
                    file.saved = file.doc.version;
                    file.idleCount=0;
                }).catch(function (err) {
                    log.error(err);
                });
            } else if (file.idleCount>10) {
                log.debug("closing pad for file "+file.file);
                clearInterval(file.saver);
                file.doc.close();
                delete docs[name];
            } else {
                file.idleCount++;
            }
        },3000);
    }
}

exports.close_pad = function (name) {
    var file = docs[name];
    if (file !== undefined) {
        log.debug("closing pad for file "+file.file);
        if (file.saver) {
            clearInterval(file.saver);
        }
        file.doc.close();
        delete docs[name];
    }
};

var channelurl;

exports.init = function (router, mount, conf) {
    channelurl = conf.get('server.protocol')+'://localhost:'+conf.get('server.port')+mount+'/channel';
    router.post('/open', bodyParser.json(), function (req, res) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        var user = req.body.user,
            project = req.body.project,
            path = req.body.path;
        openpad(user,project,path).then(function(data) {
            res.send({ok: true, data:data});
        }).catch(function(error) {
            applog.warn(error);
            res.send({ok: false, error: error});
        });
    });
    router.post('/keepalive', bodyParser.json(), function (req, res) {
        var paths = req.body.paths;
        var ok = true;
        for (var i=0; ok && i<paths.length; i++) {
            if (docs[paths[i]] === undefined) {
                res.send({ok: false, error: 'the server has restarted, please refresh the page'});
                ok = false;
            } else {
                docs[paths[i]].idleCount = 0;
            }
        }
        if (ok) { res.send({ok: true}); }
    });
    sharejs.attach(router, {db: {type: 'none'}});
}

var padNumber=0;
function openpad (user, project, path) {
    var fullpath = user + '/' + project + '/' + path;
    if (docs[fullpath]) {
        log.debug("opening existing pad for file "+fullpath);
        startSaving(fullpath);
        return Promise.resolve({ mode: docs[fullpath].mode, name: docs[fullpath].name, type: docs[fullpath].type });
    } else {
        log.debug("creating pad for file "+fullpath);
        var d = docs[fullpath] = { file: fullpath };
        return db.file.get(user, project, path)
        .then(function (file) {
            d.name = "doc_"+(padNumber++);
            d.mode = modes[fullpath.substr(fullpath.search(/\.[^.]+$/)+1)];
            d.type = file.type;
            return new Promise(function(resolve, reject) {
                client.open(d.name, d.type, channelurl, function(error, doc) {
                    if (error) { reject(error); }
                    d.doc = doc;
                    resolve(store.readFile(d.file));
                });
            });
        }).then(function (content) {
            return new Promise(function(resolve, reject) {
                if (d.type === 'text') {
                    d.doc.insert(0, content, function (err) {
                        if (err) { reject(err); }
                        log.debug("created text pad for file "+d.file+" ("+d.name+")");
                        startSaving(d.file);
                        resolve({ mode: d.mode, name: d.name, type: d.type });
                    });
                } else {
                    var o;
                    try { o = JSON.parse(content); }
                    catch (e) { o = {}; }
                    d.doc.at().set(o, function (err) {
                        if (err) { reject(err); }
                        log.debug("created json pad for file "+d.file+" ("+d.name+")");
                        startSaving(file);
                        resolve({ mode: d.mode, name: d.name, type: d.type });
                    });
                }
            });
        });
    }
};
