var crypto = require('crypto'),
    log4js = require('log4js'),
    store = require('./store');

var log = log4js.getLogger('auth');

var sessions = {};

exports.login = function (username, password) {
    return store.getUser(username)
    .then(function(user) {
        var salted = password+user.salt;
        var hash = crypto.createHash('md5').update(salted).digest('hex');
        if (user.hash == hash) {
            var token = crypto.randomBytes(48).toString('hex');
            sessions[token] = { user: username };
            log.info('logged in '+username);
            return token;
        } else {
            throw new Error("wrong credentials");
        }
    }, function(error) {
        throw new Error("wrong credentials");
    });
};
