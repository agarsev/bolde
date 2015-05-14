var fs = require('fs-promise'),
    yaml = require('js-yaml'),
    log4js = require('log4js');

var log = log4js.getLogger('store');

var config;

exports.init = function (conf) {
    config = conf;
};

exports.load = function() {
    var resource = Array.prototype.slice.call(arguments).join('/');
    return fs.readFile(config.get('user_files')+'/'+resource+'.yml', {encoding: 'utf8'})
    .then(function(data) { return yaml.safeLoad(data); });
}

exports.write = function (data) {
    var resource = Array.prototype.slice.call(arguments, 1).join('/');
    return fs.outputFile(config.get('user_files')+'/'+resource+'.yml', yaml.safeDump(data));
}

exports.deleteFolder = function (path) {
    return fs.remove(config.get('user_files')+'/'+path);
};

exports.newFile = function (path) {
    return fs.ensureFile(config.get('user_files')+'/'+path);
};

exports.deleteFile = function (path) {
    return fs.remove(config.get('user_files')+'/'+path);
};

exports.readFile = function (path) {
    return fs.readFile(config.get('user_files')+'/'+path, {encoding: 'utf8'});
};

exports.writeFile = function (path, data) {
    return fs.outputFile(config.get('user_files')+'/'+path, data);
};
