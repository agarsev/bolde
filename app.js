var express = require('express'),
    morgan = require('morgan'),
    files = require('./files');

var app = express();

app.use(morgan('combined'))
   .use('/api/list/', function(req, res) {
       files.dirlist(req.path, function(list) {
           res.status(200).send(list);
       });
   })
   .use('/api/file/', function(req, res) {
       files.getfile(req.path, function(content) {
           res.status(200).send(content);
       });
   })
   .use('/', express.static('.'))
   .listen(3000);
