var fs = require('fs-extra'),
    log4js = require('log4js');

var log = log4js.getLogger('store');

var uf;

exports.init = function (conf) {
    uf = conf.user_files+'/';
};

exports.deleteFolder = function (path) {
    return fs.remove(uf+path);
};

exports.copyFolder = function (src, dest) {
    return fs.copy(uf+src, uf+dest);
};

exports.newFile = function (path) {
    return fs.ensureFile(uf+path);
};

exports.newDir = function (path) {
    return fs.mkdir(uf+path);
};

exports.deleteFile = function (path) {
    return fs.remove(uf+path);
};

exports.readFile = function (path) {
    return fs.readFile(uf+path, {encoding: 'utf8'});
};

exports.writeFile = function (path, data) {
    return fs.outputFile(uf+path, data);
};

exports.copyFile = function (from, to) {
    return fs.copy(uf+from, uf+to);
};

exports.move = function (from, to) {
    return fs.move(uf+from, uf+to);
};

exports.realpath = path => uf+path;
