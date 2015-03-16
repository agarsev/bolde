var express = require('express'),
    fs = require('fs'),
    sharejs = require('share').server,
    client = require('share').client;

var router = express();

var docs = {};

var path = 'user_files/';

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
        console.log("api/sharejs: opening existing file "+file);
        res.status(200).send({
            mode: docs[file].mode,
            name: docs[file].name
        });
    } else {
        console.log("api/sharejs: creating file "+file);
        var name = "doc_"+(i++);
        var mode = modes[file.substr(file.search(/\.[^.]+$/)+1)];
        docs[file] = {name: name, mode: mode};
        client.open(name, 'text', 'http://localhost:3000/api/sharejs/channel', function(error, doc) {
            doc.insert(0, fs.readFileSync(path+file, { encoding: 'utf8' }), function () {
                console.log("api/sharejs: created file "+file+" ("+name+")");
                res.status(200).send({
                    mode: mode,
                    name: name
                });
            });
        });
    }
});

module.exports = router;
