var db = require('../db').query;

function decode (doc) {
    return {
        path: doc.path,
        user: doc.owner,
        project: doc.project,
        type: doc.type
    };
}


exports.new = function (user, project, path, type) {
    var doc = {
        _type: 'file',
        owner: user,
        project, path, type
    }
    return db.insert(doc);
};

exports.remove = function (user, project, path) {
    var match = {
        _type: 'file',
        owner: user,
    };
    if (project !== undefined) {
        match.project = project;
    }
    if (path !== undefined) {
        match.path = new Regexp('(^'+path+'$)|(^'+path+'/.*)')
    };
    return db.remove(match, {multi: true});
};

exports.get = function (user, project, path) {
    var match = {
        _type: 'file',
        owner: user,
        project, path
    };
    return db.findOne(match)
    .then(decode);
};

exports.all = function (user, project) {
    var match = {
        _type: 'file',
        owner: user,
        project
    };
    return db.findAll(match)
    .then(docs => docs.map(decode));
};
