var express = require('express'),
    yaml = require('js-yaml'),
    fs = require('fs'),
    crypto = require('crypto');

var router = express.Router();

var path = 'user_files/';

var users = yaml.safeLoad(fs.readFileSync(path+'users.yml', 'utf8'));
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
            console.log('Logged in '+us);
            var token = crypto.randomBytes(48).toString('hex');
            sessions[token] = { user: us };
            var resp = { ok: true, token: token };
            fs.readFile(path+us+'/settings.yml', function(err, data) {
                if (!err) {
                    resp.settings = yaml.safeLoad(data);
                }
                fs.readFile(path+us+'/projects.yml', function(err, data) {
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

module.exports = router;
