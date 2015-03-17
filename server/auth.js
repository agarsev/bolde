var express = require('express'),
    yaml = require('js-yaml'),
    fs = require('fs'),
    crypto = require('crypto');

module.exports = function(config) {

var router = express.Router();

var users = yaml.safeLoad(fs.readFileSync(config.get('user_files')+'/users.yml', 'utf8'));
var sessions = {};

router.use(function(req, res, next) {
    if (req.body.token && sessions[req.body.token]) {
        req.user = sessions[req.body.token].user;
    }
    next();
});

router.use('/login', function(req, res, next) {
    var us = req.body.user;
    if (users[us]) {
        var salted = req.body.password+users[us].salt;
        var hash = crypto.createHash('md5').update(salted).digest('hex');
        if (users[us].hash == hash) {
            console.log(req.baseUrl+': logged in '+us);
            var token = crypto.randomBytes(48).toString('hex');
            sessions[token] = { user: us };
            var resp = { ok: true, token: token };
            var path = config.get('user_files')+'/'+us;
            fs.readFile(path+'/settings.yml', function(err, data) {
                if (!err) {
                    resp.settings = yaml.safeLoad(data);
                }
                fs.readFile(path+'/projects.yml', function(err, data) {
                    if (!err) {
                        resp.projects = yaml.safeLoad(data);
                    }
                    res.status(200).send(resp);
                });
            });
            return;
        }
    }
    res.status(200).send({ ok: false, error: 'wrong credentials' });
});

return router;

}; // module.exports
