var crypto = require('crypto'),
    log4js = require('log4js'),
    store = require('./store');

var log = log4js.getLogger('auth');

var users;
store.load('users').then(function(x) { users = x; });

var sessions = {};

exports.login = function (username, password) {
    var user = users[username];
    if (!user) {
        return Promise.reject("Invalid username or password");
    } else {
        var salted = password+user.salt;
        var hash = crypto.createHash('md5').update(salted).digest('hex');
        if (user.hash == hash) {
            var token = crypto.randomBytes(48).toString('hex');
            sessions[token] = { user: username };
            log.info('logged in '+username);
            return Promise.resolve(token);
        } else {
            return Promise.reject("Invalid username or password");
        }
    }
};
