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

function startSaving(file) {
    file.saved = file.doc.version;
    file.idleCount= 0;
    file.saver = setInterval(function() {
        if (file.doc.version>file.saved) {
            log.debug("Saving file "+file.file);
            store.writeFile(file.file, file.doc.snapshot)
            .then(function () {
                file.saved = file.doc.version;
                file.idleCount=0;
            }).catch(function (err) {
                log.error(err);
            });
        } else if (file.idleCount>100) {
            clearInterval(file.saver);
            file.doc.close();
        } else {
            file.idleCount++;
        }
    },3000);
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
    sharejs.attach(router, {db: {type: 'none'}});
}

var padNumber=0;
function openpad (file) {
    if (docs[file]) {
        log.debug("opening existing pad for file "+file);
        startSaving(docs[file]);
        return Promise.resolve({ mode: docs[file].mode, name: docs[file].name });
    } else {
        log.debug("creating pad for file "+file);
        var name = "doc_"+(padNumber++);
        var mode = modes[file.substr(file.search(/\.[^.]+$/)+1)];
        docs[file] = {file: file, name: name, mode: mode};
        return new Promise(function(resolve, reject) {
            client.open(name, 'text', channelurl, function(error, doc) {
                if (error) { reject(error); }
                docs[file].doc = doc;
                resolve(store.readFile(file));
            });
        }).then(function (content) {
            return new Promise(function(resolve, reject) {
                docs[file].doc.insert(0, content, function (err) {
                    if (err) { reject(err); }
                    log.debug("created pad for file "+file+" ("+name+")");
                    // TODO close properly when no longer used
                    startSaving(docs[file]);
                    resolve({ mode: mode, name: name });
                });
            });
        });
    }
};
