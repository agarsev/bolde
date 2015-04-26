var express = require('express'),
    fs = require('fs'),
    sharejs = require('share').server,
    client = require('share').client;

module.exports = function(config) {

var router = express();

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
            console.log("Saving file "+file.file);
            fs.writeFileSync(config.get('user_files')+file.file, file.doc.snapshot);
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

sharejs.attach(router, {db: {type: 'none'}});

var padNumber=0;
router.use('/open', function (req, res) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    var file = req.path;
    if (docs[file]) {
        console.log(router.mountpath+": opening existing pad for file "+file);
        startSaving(docs[file]);
        res.send({ ok: true, data:{
            mode: docs[file].mode,
            name: docs[file].name
        }});
    } else {
        console.log(router.mountpath+": creating pad for file "+file);
        var name = "doc_"+(padNumber++);
        var mode = modes[file.substr(file.search(/\.[^.]+$/)+1)];
        docs[file] = {file: file, name: name, mode: mode};
        client.open(name, 'text',
                config.get('server.protocol')+'://localhost:'+config.get('server.port')+router.mountpath+'/channel',
                function(error, doc) {
            var filename = config.get('user_files')+file;
            docs[file].doc = doc;
            doc.insert(0, fs.readFileSync(filename, { encoding: 'utf8' }), function () {
                console.log(router.mountpath+": created pad for file "+file+" ("+name+")");
                res.send({ ok: true, data:{
                    mode: mode,
                    name: name
                }});
            });
            // TODO close properly when no longer used
            startSaving(docs[file]);
        });
    }
});

return router;

}; // module.exports
