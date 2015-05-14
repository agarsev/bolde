// TODO split
var fs = require('fs-promise'),
    yaml = require('js-yaml'),
    log4js = require('log4js');

var log = log4js.getLogger('store');

var config;
var users;

exports.init = function (conf) {
    config = conf;
    users = yaml.safeLoad(fs.readFileSync(conf.get('user_files')+'/users.yml', 'utf8'));
};

function loadYML (file) {
    return fs.readFile(file, {encoding: 'utf8'})
    .then(function(data) { return yaml.safeLoad(data); });
}

function writeYML (file, data) {
    return fs.writeFile(file, yaml.safeDump(data));
}

exports.load = function() {
    var resource = Array.prototype.slice.call(arguments).join('/');
    return fs.readFile(config.get('user_files')+'/'+resource+'.yml', {encoding: 'utf8'})
    .then(function(data) { return yaml.safeLoad(data); });
}

exports.write = function (data) {
    var resource = Array.prototype.slice.call(arguments, 1).join('/');
    return fs.outputFile(config.get('user_files')+'/'+resource+'.yml', yaml.safeDump(data));
}

exports.getUserSettings = function (user) {
    return loadYML(config.get('user_files')+'/'+user+'/settings.yml');
};

exports.getUserProjects = function (user) {
    return loadYML(config.get('user_files')+'/'+user+'/projects.yml');
};

exports.updateUserSettings = function (user, settings) {
    return writeYML(config.get('user_files')+'/'+user+'/settings.yml', settings);
};

exports.getUser = function (user) {
    return new Promise(function (resolve, reject) {
        if (users[user]) { resolve(users[user]); }
        else { reject("No such user"); }
    });
};

exports.deleteProject = function (user, project) {
    return fs.remove(config.get('user_files')+'/'+user+'/'+project);
};

exports.newFile = function (user, project, file) {
    return fs.ensureFile(config.get('user_files')+'/'+user+'/'+project+'/'+file);
};

exports.deleteFile = function (user, project, file) {
    return fs.remove(config.get('user_files')+'/'+user+'/'+project+'/'+file);
};

exports.getFile = function (path) {
    return fs.readFile(config.get('user_files')+'/'+path, {encoding: 'utf8'});
};
