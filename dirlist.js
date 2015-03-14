var fs = require('fs');

var path = 'user_files/';

module.exports = function (dir, callback) {
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
