var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    log4js = require('log4js'),
    yaml = require('js-yaml'),
    compression = require('compression'),
    config = require('config');

var store = require('./store');
store.init(config);

var sharejs = require('./sharejs'),
    auth = require('./auth');

var app = express();
var server = http.createServer(app);

log4js.configure(config.log);
var httplog = log4js.getLogger('http');
app.use(log4js.connectLogger(httplog, {
    level: 'auto',
    format: ':remote-addr :method :url HTTP/:http-version :status :res[content-length] - :response-time ms :referrer :user-agent',
    nolog: /^\/api\/sharejs\/(channel|keepalive)/
}));

var applog = log4js.getLogger('app');

var shareRoute = express();
sharejs.init(shareRoute, '/api/sharejs', config);
app.use('/api/sharejs', shareRoute);

app.use(bodyParser.json());

app.post('/api/login', function (req, res) {
    var token;
    auth.login(req.body.user, req.body.password)
    .then(function(tok) {
        token = tok;
        return Promise.all([store.load(req.body.user, 'settings'),
                            store.load(req.body.user, 'projects')]);
    }).then(function(results) {
        res.send({ok: true, data:{ token:token, projects: results[1], settings:results[0]}});
    }).catch(function(error) {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

app.post('/api/settings/update', function (req, res) {
    store.write(req.body.settings, req.body.user, 'settings')
    .then(function() {
        res.send({ok: true, data: {}});
    }).catch(function (error) {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

app.use('/api/project', require('./project'));

// TODO permissions
app.use('/api/file/delete', function (req, res, next) {
    var user = req.body.user,
        project = req.body.project,
        path = req.body.path,
        fullname = user+'/'+project+'/'+path;
    sharejs.close_pad(fullname);
    next();
});
app.use('/api/file', require('./file'));

app.use(compression());
app.use(express.static('build'));
app.use(express.static('static'));
app.use('/ace', express.static('bower_components/ace-builds/src-min-noconflict'));

server.listen(config.get('server.port'), config.get('server.hostname'));
