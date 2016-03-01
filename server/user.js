var crypto = require('crypto'),
    express = require('express'),
    SSE = require('sse-pusher'),
    log4js = require('log4js');

var store = require('./store');

var log = log4js.getLogger('auth');

var Router = new express.Router();

var default_messages = {
    "Welcome!%%BOLDE": [
        { them: '*Welcome* to the system.' }
    ]
};

var users;
store.load('users')
.then(function(x) { users = x; })
.catch(function() { users = {}; })

var sessions = {};
var ssestreams = {};

Router.post('/login', function (req, res) {
    var username = req.body.user,
        password = req.body.password,
        user = users[username];
    if (!user) {
        log.debug("Invalid username at login: "+username);
        res.send({ok:false, error:"Invalid username or password"});
    } else {
        var salted = password+user.salt;
        var hash = crypto.createHash('md5').update(salted).digest('hex');
        if (user.hash == hash) {
            var token = crypto.randomBytes(48).toString('hex');
            sessions[token] = { user: username };
            log.info('logged in '+username);
            var stream = SSE(res);
            ssestreams[username] = stream;
            Router.get('/sse/'+username, stream.handler());
            Promise.all([store.load(username, 'settings'),
                         store.load(username, 'messages'),
                         store.load(username, 'projects')])
            .then(function(results) {
                res.send({ok: true, data: {
                    token:token,
                    messages: results[1],
                    projects: results[2],
                    settings:results[0]
                }});
            });
        } else {
            log.debug("Invalid login for user "+username);
            res.send({ok:false, error:"Invalid username or password"});
        }
    }
});

Router.post('/new', function (req, res) {
    var username = req.body.user,
        password = req.body.password;
    if (users[username] || !username || !password || username == 'BOLDE') {
        log.error("username "+username+" already in use");
        res.send({ok:false, error:"Username already exists"});
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
        store.write(default_messages, username, 'messages');
        store.write(users, 'users');
        log.warn('created user '+username);
        res.send({ok: true, data: "Created "+username});
    };
});

Router.post('/settings', function (req, res) {
    store.write(req.body.settings, req.body.user, 'settings')
    .then(function() {
        res.send({ok: true, data: {}});
    }).catch(function (error) {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/message', function (req, res) {
    var from = req.body.from,
        to = req.body.to,
        subject = req.body.subject,
        text = req.body.text,
        snd, rcp;
    if (!users[to]) {
        res.send({ok: false, error: 'No such user'});
        return;
    }
    Promise.all([store.load(from, 'messages'),
                 store.load(to, 'messages')])
    .then(function(msgs) {
        snd = msgs[0]; rcp = msgs[1];
        var sndtitle = subject+'%%'+to,
            rcptitle = subject+'%%'+from;
        if (!snd[sndtitle]) { snd[sndtitle] = []; }
        if (!rcp[rcptitle]) { rcp[rcptitle] = []; }
        snd[sndtitle].push({ me: text });
        rcp[rcptitle].push({ them: text });
        return Promise.all([store.write(snd, from, 'messages'),
                            store.write(rcp, to, 'messages')]);
    }).then(function () {
        res.send({ok: true, data: snd });
        ssestreams[to]({ action: 'messages', messages: rcp });
    }).catch(function (error) {
        applog.warn(error);
        res.send({ok: false, error: error });
    });
});

Router.post('/clearmessages', function (req, res) {
    var from = req.body.from,
        to = req.body.to,
        subject = req.body.subject,
        snd;
    store.load(from, 'messages')
    .then(function(msgs) {
        snd = msgs;
        delete snd[subject+'%%'+to];
        return store.write(snd, from, 'messages');
    }).then(function () {
        res.send({ok: true, data: snd });
    }).catch(function (error) {
        applog.warn(error);
        res.send({ok: false, error: error });
    });
});

module.exports = Router;
