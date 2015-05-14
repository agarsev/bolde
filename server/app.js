var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    log4js = require('log4js'),
    morgan = require('morgan'),
    yaml = require('js-yaml'),
    config = require('config'),

    sharejs = require('./sharejs'),
    auth = require('./auth'),
    store = require('./store');

var app = express();
var server = http.createServer(app);

store.init(config);

var applog = log4js.getLogger('app');
var httplog = log4js.getLogger('http');
app.use(morgan(':remote-addr :method :url HTTP/:http-version :status :res[content-length] - :response-time ms :referrer :user-agent', {
    skip: function (req, res) {
        // TODO: skip sharejs
        return false;
    },
    stream: {
        write: str => httplog.debug(str.trimRight())
    }
}));

var shareRoute = express();
sharejs.init(shareRoute, '/api/sharejs', config);
app.use('/api/sharejs', shareRoute);

app.use(bodyParser.json());

app.post('/api/sharejs/open', function (req, res) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    var file = req.body.file;
    sharejs.open(file).then(function(data) {
        res.send({ok: true, data:data});
    }).catch(function(error) {
        applog.warn(error);
        res.send({ok: false, error: error});
    });
});

app.post('/api/login', function (req, res) {
    var token;
    auth.login(req.body.user, req.body.password)
    .then(function(tok) {
        token = tok;
        return Promise.all([store.getUserSettings(req.body.user),
                            store.getUserProjects(req.body.user)]);
    }).then(function(results) {
        res.send({ok: true, data:{ token:token, projects: results[1], settings:results[0]}});
    }).catch(function(error) {
        applog.warn(error);
        res.send({ok: false, error:error.message});
    });
});

app.post('/api/settings/update', function (req, res) {
    store.updateUserSettings(req.body.user, req.body.settings)
    .then(function(settings) {
        res.send({ok: true, data: {settings: settings}});
    }).catch(function (error) {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

app.use('/api/project', require('./project'));

// TODO permissions
app.use('/api/file', require('./file'));

app.use('/', express.static('.'));

server.listen(config.get('server.port'), config.get('server.hostname'));
