// TODO split
var fs = require('fs'),
    yaml = require('js-yaml'),
    rimraf = require('rimraf'),
    log4js = require('log4js');

var log = log4js.getLogger('store');

var config;
var users;

exports.init = function (conf) {
    config = conf;
    users = yaml.safeLoad(fs.readFileSync(conf.get('user_files')+'/users.yml', 'utf8'));
};

function loadYML (file) {
    return new Promise(function (resolve, reject) {
        fs.readFile(file, { encoding: 'utf8'}, function (err, data) {
            if (err) { reject(err);
            } else { resolve(yaml.safeLoad(data)); }
        });
    });
}

function writeYML (file, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(file, yaml.safeDump(data), function (err, data) {
            if (err) { reject(err);
            } else { resolve(); }
        });
    });
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

exports.getProjectFiles = function (project) {
    return loadYML(config.get('user_files')+'/'+project+'/files.yml');
};

exports.createProject = function (user, project) {
    var userpath = config.get('user_files')+'/'+user;
    return new Promise(function (resolve, reject) {
        fs.mkdir(userpath+'/'+project, function (err) {
            if (err) { reject(err); }
            else { resolve(); }
        });
    }).then(function () {
        return fs.writeFile(userpath+'/'+project+'/files.yml', '{}', function (err) {
            if (err) { throw err; }
            else { return; }
        });
    }).then(loadYML.bind(null,userpath+'/projects.yml'))
    .then(function(projects) {
        projects[project] = { desc: '' };
        return writeYML(userpath+'/projects.yml', projects);
    }).then(function() {
        log.info('created project '+user+'/'+project);
        return;
    });
};

exports.deleteProject = function (user, project) {
    var userpath = config.get('user_files')+'/'+user;
    return new Promise(function (resolve, reject) {
        rimraf(userpath+'/'+project, function (err) {
            if (err) { reject(err); }
            else { resolve(); }
        });
    }).then(loadYML.bind(null,userpath+'/projects.yml'))
    .then(function(projects) {
        delete projects[project];
        return writeYML(userpath+'/projects.yml', projects);
    }).then(function () {
        log.info('deleted project '+user+'/'+project);
        return;
    });
};

// TODO files in subdirs
exports.newFile = function (user, project, file) {
    var projectpath = config.get('user_files')+'/'+user+'/'+project;
    var path = projectpath+'/'+file;
    var nufiles;
    return new Promise(function(resolve, reject) {
        if (fs.existsSync(path)) {
            reject('File already exists');
        } else {
            fs.writeFile(path,'', function (err) {
                if (err) { reject(err); }
                else { resolve(); }
            });
        }
    }).then(loadYML.bind(null,projectpath+'/files.yml'))
    .then(function (files) {
        nufiles = files;
        files[file] = { type: 'javascript' };
        return writeYML(projectpath+'/files.yml', files);
    }).then(function() {
        log.debug('new file '+user+'/'+project+'/'+file);
        return nufiles;
    });
};

// TODO files in subdirs
exports.deleteFile = function (user, project, file) {
    var projectpath = config.get('user_files')+'/'+user+'/'+project;
    var path = projectpath+'/'+file;
    var nufiles;
    return new Promise(function(resolve, reject) {
        if (!fs.existsSync(path)) {
            reject('File does not exist');
        } else {
            fs.unlink(path, function (err) {
                if (err) { reject(err); }
                else { resolve(); }
            });
        }
    }).then(loadYML.bind(null,projectpath+'/files.yml'))
    .then(function (files) {
        delete files[file];
        nufiles = files;
        return writeYML(projectpath+'/files.yml', files);
    }).then(function() {
        log.debug('deleted file '+user+'/'+project+'/'+file);
        return nufiles;
    });
};

// TODO move to file.js
exports.getFile = function (path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(config.get('user_files')+'/'+path, { encoding: 'utf8'}, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
