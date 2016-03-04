var fs = require('fs-promise'),
    nedb = require('nedb'),
    log4js = require('log4js'),
    respath = require('../src/utils/path');

var log = log4js.getLogger('store');

var user_files, db;

exports.init = function (conf) {
    user_files = conf.user_files
    db = new nedb({
        filename: conf.db,
        autoload: true,
        onload: (error) => {
            if (error) {
                log.error('Could not load database file: '+conf.db);
            } else {
                log.info('Loaded database file: '+conf.db)
            }
        }
    })
};

exports.find = function (query, projection) {
    return new Promise(function (resolve, reject) {
        var solve = function (err, doc) {
            if (err || doc == null) {
                reject(err);
            } else {
                resolve(doc);
            }
        };
        if (projection) {
            db.findOne(query, projection, solve);
        } else {
            db.findOne(query, solve);
        }
    });
};

exports.findall = function (query, projection) {
    return new Promise(function (resolve, reject) {
        var solve = function (err, docs) {
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        };
        if (projection) {
            db.find(query, projection, solve);
        } else {
            db.find(query, solve);
        }
    });
};

exports.insert = function (doc) {
    return new Promise(function (resolve, reject) {
        db.insert(doc, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

exports.remove = function (query, opts) {
    db.remove(query, opts || {});
};

exports.update = function (query, update, opts) {
    return new Promise(function (resolve, reject) {
        db.update(query, update, opts || {}, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

exports.deleteFolder = function (path) {
    return fs.remove(user_files+'/'+path);
};

exports.copyFolder = function (src, dest) {
    var us = user_files+'/';
    return fs.copy(us+src, us+dest);
};

exports.newFile = function (path) {
    return fs.ensureFile(user_files+'/'+path);
};

exports.newDir = function (path) {
    return fs.mkdir(user_files+'/'+path);
};

exports.deleteFile = function (path) {
    return fs.remove(user_files+'/'+path);
};

exports.readFile = function (path) {
    return fs.readFile(user_files+'/'+path, {encoding: 'utf8'});
};

exports.writeFile = function (path, data) {
    return fs.outputFile(user_files+'/'+path, data);
};

exports.copyFile = function (from, to) {
    var uf = user_files+'/';
    return fs.readFile(uf+from)
    .then(function (data) {
        return fs.outputFile(uf+to, data);
    });
};
