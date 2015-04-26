var fs = require('fs'),
    yaml = require('js-yaml');

var config;
var users;

exports.init = function (conf) {
    config = conf;
    users = yaml.safeLoad(fs.readFileSync(conf.get('user_files')+'/users.yml', 'utf8'));
};

function loadYML (file) {
    return new Promise(function (resolve, reject) {
        fs.readFile(file, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(yaml.safeLoad(data));
            }
        });
    });
}

exports.getUserSettings = function (user) {
    return loadYML(config.get('user_files')+'/'+user+'/settings.yml');
};

exports.getUserProjects = function (user) {
    return loadYML(config.get('user_files')+'/'+user+'/projects.yml');
};

exports.getUser = function (user) {
    return new Promise(function (resolve, reject) {
        if (users[user]) { resolve(users[user]); }
        else { reject("No such user"); }
    });
};

exports.getProjectFiles = function (project) {
    return loadYML(config.get('user_files')+'/'+project+'/files.yml');
};
