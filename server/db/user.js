var db = require('../db').query;
var project = require('./project');

function decode (doc) {
    return {
        user: doc.name,
        salt: doc.salt,
        hash: doc.hash,
        settings: doc.settings
    };
}

exports.new = function (user, salt, hash, settings) {
    var doc = {
        _type: 'user',
        name: user,
        salt, hash, settings
    };
    return db.insert(doc);
};

exports.get = function (user) {
    var match = {
        _type: 'user',
        name: user,
    };
    return db.findOne(match).then(decode);
};

exports.remove = function (user) {
    var match = {
        _type: 'user',
        name: user
    };
    return db.remove(match)
    .then(() => project.remove(user));
};

exports.setsettings = function (user, settings) {
    var match = {
        _type: 'user',
        name: user,
    };
    return db.update(match, { $set: { settings } });
};
