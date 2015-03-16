var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    yaml = require('js-yaml'),
    fs = require('fs'),
    sharejs = require('./server/sharejs'),
    auth = require('./server/auth');

var app = express();
var server = http.createServer(app);

app.use('/api/sharejs',sharejs);
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use('/api', auth);
app.use('/', express.static('.'));

server.listen(3000);
