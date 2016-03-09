var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    log4js = require('log4js'),
    yaml = require('js-yaml'),
    compression = require('compression'),
    config = require('config');

var store = require('./store');
store.init(config);

var db = require('./db');
db.init(config);

var sharejs = require('./sharejs'),
    user = require('./user');

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

// TODO permissions

app.use('/api/user/', require('./user').router);
app.use('/api/project', require('./project'));

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
