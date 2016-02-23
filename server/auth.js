var crypto = require('crypto'),
    log4js = require('log4js'),
    store = require('./store');

var log = log4js.getLogger('auth');

var users;
store.load('users')
.then(function(x) { users = x; })
.catch(function() { users = {}; })

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

exports.createUser = function (username, password) {
    if (users[username] || !username || !password) {
        return Promise.reject("Username already exists");
    } else {
        var salt = crypto.randomBytes(16).toString('hex');
        var salted = password+salt;
        var hash = crypto.createHash('md5').update(salted).digest('hex');
        users[username] = {
            salt: salt,
            hash: hash
        };
        store.newDir(username);
        store.write({}, username, 'projects');
        store.write({editor: 'default'}, username, 'settings');
        store.write(users, 'users');
        log.warn('created user '+username);
        return Promise.resolve("Created "+username);
    }
};
