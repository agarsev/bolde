var fs = require('fs'),
    sharejs = require('share').server,
    client = require('share').client,
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
            fs.writeFileSync(config.get('user_files')+'/'+file.file, file.doc.snapshot);
            file.saved = file.doc.version;
            file.idleCount=0;
        } else if (file.idleCount>100) {
            clearInterval(file.saver);
            file.doc.close();
        } else {
            file.idleCount++;
        }
    },3000);
}

var mountpath;
var config;
exports.init = function (router, mount, conf) {
    config = conf;
    mountpath = mount;
    sharejs.attach(router, {db: {type: 'none'}});
}

var padNumber=0;
exports.open = function(file) {
    return new Promise(function(resolve, reject) {
        if (docs[file]) {
            log.debug("opening existing pad for file "+file);
            startSaving(docs[file]);
            resolve({ mode: docs[file].mode, name: docs[file].name });
        } else {
            log.debug("creating pad for file "+file);
            var name = "doc_"+(padNumber++);
            var mode = modes[file.substr(file.search(/\.[^.]+$/)+1)];
            docs[file] = {file: file, name: name, mode: mode};
            client.open(name, 'text',
                    config.get('server.protocol')+'://localhost:'+config.get('server.port')+mountpath+'/channel',
                    function(error, doc) {
                if (error) { reject(error); }
                docs[file].doc = doc;
                store.getFile(file).then(function (content) {
                    doc.insert(0, content, function () {
                        log.debug("created pad for file "+file+" ("+name+")");
                        resolve({ mode: mode, name: name });
                        // TODO close properly when no longer used
                        startSaving(docs[file]);
                    });
                }).catch(function(error) {
                    reject(error);
                });
            });
        }
    });
};
