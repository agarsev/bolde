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
            doc.insert(0, fs.readFileSync(config.get('user_files')+file, { encoding: 'utf8' }), function () {
                console.log(router.mountpath+": created pad for file "+file+" ("+name+")");
                res.status(200).send({
                    mode: mode,
                    name: name
                });
            });
        });
    }
});

return router;

}; // module.exports
