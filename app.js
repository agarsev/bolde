var express = require('express'),
    morgan = require('morgan'),
    dirlist = require('./dirlist');

var app = express();

app.use(morgan('combined'))
   .use('/api/list/', function(req, res) {
       dirlist(req.path, function(list) {
           res.status(200).send(list);
       });
   })
   .use('/', express.static('.'))
   .listen(3000);
