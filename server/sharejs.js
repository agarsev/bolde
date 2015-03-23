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
    'pm': 'perl'
};

var i = 0;

sharejs.attach(router, {db: {type: 'none'}});

router.use('/open', function (req, res) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    var file = req.path;
    if (docs[file]) {
        console.log(router.mountpath+": opening existing pad for file "+file);
        res.status(200).send({
            mode: docs[file].mode,
            name: docs[file].name
        });
    } else {
        console.log(router.mountpath+": creating pad for file "+file);
        var name = "doc_"+(i++);
        var mode = modes[file.substr(file.search(/\.[^.]+$/)+1)];
        docs[file] = {name: name, mode: mode};
        client.open(name, 'text',
                config.get('server.protocol')+'://localhost:'+config.get('server.port')+router.mountpath+'/channel',
                function(error, doc) {
            var filename = config.get('user_files')+file;
            doc.insert(0, fs.readFileSync(filename, { encoding: 'utf8' }), function () {
                console.log(router.mountpath+": created pad for file "+file+" ("+name+")");
                res.status(200).send({
                    mode: mode,
                    name: name
                });
            });
            // TODO close properly when no longer used
            var version = doc.version;
            var counts = 0;
            var saver = setInterval(function() {
                if (doc.version>version) {
                    console.log("Saving file "+filename);
                    fs.writeFileSync(filename, doc.snapshot);
                    version = doc.version;
                    counts=0;
                } else if (counts>10) {
                    clearInterval(saver);
                    doc.close();
                } else {
                    counts++;
                }
            },3000);
        });
    }
});

return router;

}; // module.exports
