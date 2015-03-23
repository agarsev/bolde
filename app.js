var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    fs = require('fs'),
    yaml = require('js-yaml'),
    config = require('config'),

    sharejs = require('./server/sharejs')(config),
    auth = require('./server/auth')(config),
    file = require('./server/file')(config);

var app = express();
var server = http.createServer(app);

app.use(morgan('combined', {
    skip: function (req, res) {
        // TODO: skip sharejs
        return false;
    }
}));
app.use('/api/sharejs',sharejs);
app.use(bodyParser.json());
app.use('/api', auth);
app.use('/api/file', file);
app.use('/', express.static('.'));

server.listen(config.get('server.port'), config.get('server.hostname'));
