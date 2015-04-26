var yaml = require('js-yaml'),
    fs = require('fs'),
    crypto = require('crypto'),
    log4js = require('log4js');

var log = log4js.getLogger('auth');

var users;
exports.init = function (userfiles) {
    users = yaml.safeLoad(fs.readFileSync(userfiles+'/users.yml', 'utf8'));
}
var sessions = {};

exports.login = function (user, password) {
    return new Promise(function (resolve, reject) {
        if (users[user]) {
            var salted = password+users[user].salt;
            var hash = crypto.createHash('md5').update(salted).digest('hex');
            if (users[user].hash == hash) {
                var token = crypto.randomBytes(48).toString('hex');
                sessions[token] = { user: user };
                log.info('logged in '+user);
                resolve(token);
            } else { reject('wrong credentials'); }
        } else { reject('wrong credentials'); }
    });
};
