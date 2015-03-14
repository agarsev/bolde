var fs = require('fs');

var path = 'user_files/';

exports.dirlist = function (dir, callback) {
    fs.readdir(path+dir, function(err, files) {
        if (err) { return; }
        var list = [];
        for(var i = 0; i<files.length; i++) {
            var f = files[i];
            var s = fs.statSync(path+dir+'/'+f);
            list.push({ name: f, type: s.isDirectory()?'dir':'text' });
        };
        callback(list);
    });
}

var modes = {
    'js': 'javascript',
    'cl': 'commonlisp',
    'pm': 'perl'
};

exports.getfile = function (file, callback) {
    fs.readFile(path+file, function(err, data) {
        if (err) { return; }
        callback({ text: data.toString(),
             type: modes[file.substr(file.search(/\.[^.]+$/)+1)]
        });
    });
}
