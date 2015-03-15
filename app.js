var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    yaml = require('js-yaml'),
    fs = require('fs'),
    files = require('./server/files'),
    auth = require('./server/auth');

var app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use('/api', auth);
app.use('/api/list/', function(req, res) {
        files.dirlist(req.path, function(list) {
            res.status(200).send(list);
        });
    });
app.use('/api/file/', function(req, res) {
        files.getfile(req.path, function(content) {
            res.status(200).send(content);
        });
    });
app.use('/', express.static('.'));
app.listen(3000);
