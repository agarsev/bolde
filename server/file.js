var yaml = require('js-yaml'),
    fs = require('fs');

exports.new = function (userpath, filepath) {
    return new Promise(function(resolve, reject) {
        var file = userpath+'/'+filepath;
        if (fs.existsSync(file)) {
            reject('File already exists');
        } else {
            fs.writeFileSync(file,'');
            resolve();
        }
    });
};

exports.delete = function (userpath, filepath) {
    return new Promise(function(resolve, reject) {
        var file = userpath+'/'+filepath;
        if (!fs.existsSync(file)) {
            reject('File does not exist');
        } else {
            fs.unlinkSync(file);
            resolve();
        }
    });
};
