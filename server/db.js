var nedb = require('nedb'),
    log4js = require('log4js');

var log = log4js.getLogger('db');

var db;

exports.init = function (conf) {
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

exports.query = {
    findOne: function (query, projection) {
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
    },
    findAll: function (query, projection) {
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
    },
    insert: function (doc) {
        delete doc._id;
        return new Promise(function (resolve, reject) {
            db.insert(doc, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },
    remove: function (query, opts) {
        db.remove(query, opts || {});
        return Promise.resolve();
    },
    update: function (query, update, opts) {
        return new Promise(function (resolve, reject) {
            db.update(query, update, opts || {}, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

exports.file = require('./db/file');
exports.project = require('./db/project');
exports.user = require('./db/user');
