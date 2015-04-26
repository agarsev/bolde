var fs = require('fs'),
    yaml = require('js-yaml');

var config;
var users;

exports.init = function (conf) {
    config = conf;
    users = yaml.safeLoad(fs.readFileSync(conf.get('user_files')+'/users.yml', 'utf8'));
};

exports.getUserSettings = function (user) {
    return Promise.resolve({});
    /* TODO
    return new Promise(function (resolve, reject) {
        var path = config.get('user_files')+'/'+user;
        fs.readFile(path+'/settings.yml', function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(yaml.safeLoad(data));
            }
        });
    });
    */
};

exports.getUserProjects = function (user) {
    return new Promise(function (resolve, reject) {
        var path = config.get('user_files')+'/'+user;
        fs.readFile(path+'/projects.yml', function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(yaml.safeLoad(data));
            }
        });
    });
};

exports.getUser = function (user) {
    return new Promise(function (resolve, reject) {
        if (users[user]) { resolve(users[user]); }
        else { reject("No such user"); }
    });
};
