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

function findOne (query, projection) {
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

function findAll (query, projection) {
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

function insert (doc) {
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
};

function remove (query, opts) {
    db.remove(query, opts || {});
    return Promise.resolve();
};

function update (query, update, opts) {
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

exports.file = {

    new: function (user, project, path, type) {
        var doc = {
            _type: 'file',
            owner: user,
            project, path, type
        }
        return insert(doc);
    },

    remove: function (user, project, path) {
        var match = {
            _type: 'file',
            owner: user,
            project: project
        };
        if (path !== undefined) {
            match.path = new Regexp('(^'+path+'$)|(^'+path+'/.*)')
        };
        return remove(match, {multi: true});
    },

    get: function (user, project, path) {
        var match = {
            _type: 'file',
            owner: user,
            project, path
        };
        return findOne(match);
    },

    all: function (user, project) {
        var match = {
            _type: 'file',
            owner: user,
            project
        };
        return findAll(match);
    }
};

exports.project = {

    new: function (user, project, desc) {
        var doc = {
            _type: 'project',
            owner: user,
            name: project,
            desc
        };
        return insert(doc);
    },

    setdesc: function (user, project, desc) {
        var match = {
            _type: 'project',
            owner: user,
            name: project
        };
        return update(match, {$set: {desc}});
    },

    remove: function (user, project) {
        var match = {
            _type: 'project',
            owner: user,
            name: project
        };
        return remove(match)
        .then(() => exports.file.remove(user));
    },

    get: function (user, project) {
        var match = {
            _type: 'project',
            owner: user,
            name: project
        };
        return findOne(match);
    },

    copy: function (user1, project1, user2, project2) {
        return exports.project.get(user1, project1)
        .then(project => exports.project.new(user2, project2, project.desc));
    },

    all: function (user) {
        var match = {
            _type: 'project',
            owner: user
        };
        return findAll(match);
    }

};

exports.user = {

    new: function (user, salt, hash, settings) {
        var doc = {
            _type: 'user',
            name: user,
            salt, hash, settings
        };
        return insert(doc);
    },

    get: function (user) {
        var match = {
            _type: 'user',
            name: user,
        };
        return findOne(match);
    },

    remove: function (user) {
        var match = {
            _type: 'user',
            name: user
        };
        return remove(match)
        .then(() => exports.project.remove(user));
    },

    setsettings: function (user, settings) {
        var match = {
            _type: 'user',
            name: user,
        };
        return update(match, { $set: { settings } });
    }

};

