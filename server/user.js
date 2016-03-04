var crypto = require('crypto'),
    express = require('express'),
    SSE = require('sse-pusher'),
    log4js = require('log4js');

var store = require('./store');

var log = log4js.getLogger('auth');

var Router = new express.Router();

var sessions = {};
var ssestreams = {};

Router.post('/login', function (req, res) {
    var username = req.body.user,
        password = req.body.password,
        res_data;
    store.find({ type: 'user', name: username })
    .then(user => {
        var salted = password+user.salt;
        var hash = crypto.createHash('md5').update(salted).digest('hex');
        if (user.hash != hash) {
            throw "Wrong password for user "+username;
        }
        var token = crypto.randomBytes(48).toString('hex');
        sessions[token] = { user: username };
        log.info('logged in '+username);
        var stream = SSE(res);
        ssestreams[username] = stream;
        Router.get('/sse/'+username, stream.handler());
        res_data = {
            token:token,
            settings: user.settings
        };
        return store.findall({ type: 'project', owner: username });
    }).then(projects => {
        res_data.projects = projects;
        res.send({ok: true, data: res_data });
    }).catch(error => {
        log.debug("Wrong login: "+error);
        res.send({ok:false, error:"Invalid username or password"});
    });
});

Router.post('/new', function (req, res) {
    var username = req.body.user,
        password = req.body.password;
    if (!username || !password || username=='BOLDE') {
        res.send({ok:false, error: "Missing username or password"});
    } else {
        var salt = crypto.randomBytes(16).toString('hex');
        var salted = password+salt;
        var hash = crypto.createHash('md5').update(salted).digest('hex');
        doc = {
            type: 'user',
            name: username,
            salt: salt,
            hash: hash,
            settings: { editor: 'default' }
        };
        store.insert(doc)
        .then(() => store.newDir(username))
        .then(() => {
            log.warn('created user '+username);
            res.send({ok: true, data: "Created "+username});
        }).catch(error => {
            store.remove({ type: 'user', name: username });
            log.error('Could not create user '+username+', error: '+error);
            res.send({ok:false, error: error});
        });
    };
});

Router.post('/settings', function (req, res) {
    var username = req.body.user,
        settings = req.body.settings;
    store.update({ type: 'user', name: username },
                 { $set: { settings: settings } })
    .then(() => res.send({ok: true, data: {}}))
    .catch(error => {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

module.exports = Router;
