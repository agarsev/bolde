var sharejs = require('share').server,
    client = require('share').client,
    bodyParser = require('body-parser'),
    log4js = require('log4js'),

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

var channelurl;

exports.init = function (router, mount, conf) {
    channelurl = conf.get('server.protocol')+'://localhost:'+conf.get('server.port')+mount+'/channel';
    router.post('/open', bodyParser.json(), function (req, res) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        var file = req.body.file;
        openpad(file).then(function(data) {
            res.send({ok: true, data:data});
        }).catch(function(error) {
            applog.warn(error);
            res.send({ok: false, error: error});
        });
    });
    router.post('/keepalive', bodyParser.json(), function (req, res) {
        var paths = req.body.paths;
        for (var i=0; i<paths.length; i++) {
            docs[paths[i]].idleCount = 0;
        }
        res.send({ok: true});
    });
    sharejs.attach(router, {db: {type: 'none'}});
}

var padNumber=0;
function openpad (file) {
    if (docs[file]) {
        log.debug("opening existing pad for file "+file);
        startSaving(file);
        return Promise.resolve({ mode: docs[file].mode, name: docs[file].name, type: docs[file].type });
    } else {
        log.debug("creating pad for file "+file);
        var d = docs[file] = { file: file };
        return store.getFileOpts(file).then(function (fileOpts) {
            d.name = "doc_"+(padNumber++);
            d.mode = modes[file.substr(file.search(/\.[^.]+$/)+1)];
            d.type = fileOpts.type;
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
                        startSaving(file);
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
