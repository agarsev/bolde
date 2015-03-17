var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    fs = require('fs'),
    yaml = require('js-yaml'),
    config = require('config'),

    sharejs = require('./server/sharejs')(config),
    auth = require('./server/auth')(config);

var app = express();
var server = http.createServer(app);

app.use('/api/sharejs',sharejs);
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use('/api', auth);
app.use('/', express.static('.'));

server.listen(config.get('server.port'), config.get('server.hostname'));
