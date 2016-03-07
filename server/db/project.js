var db = require('../db').query;
var file = require('./file');

function decode (doc) {
    return {
        name: doc.name,
        user: doc.owner,
        desc: doc.desc
    };
}


exports.new = function (user, project, desc) {
    var doc = {
        _type: 'project',
        owner: user,
        name: project,
        desc
    };
    return db.insert(doc);
};

exports.setdesc = function (user, project, desc) {
    var match = {
        _type: 'project',
        owner: user,
        name: project
    };
    return db.update(match, {$set: {desc}});
};

exports.remove = function (user, project) {
    var match = {
        _type: 'project',
        owner: user,
    };
    if (project !== undefined) {
        match.name = project;
    }
    return db.remove(match)
    .then(() => file.remove(user));
};

exports.get = function (user, project) {
    var match = {
        _type: 'project',
        owner: user,
        name: project
    };
    return db.findOne(match).then(decode);
};

exports.copy = function (user1, project1, user2, project2) {
    return exports.get(user1, project1)
    .then(project => exports.new(user2, project2, project.desc));
};

exports.all = function (user) {
    var match = {
        _type: 'project',
        owner: user
    };
    return db.findAll(match)
    .then(projects => projects.map(decode));
};
