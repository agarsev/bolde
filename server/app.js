var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    log4js = require('log4js'),
    morgan = require('morgan'),
    fs = require('fs'),
    yaml = require('js-yaml'),
    config = require('config'),

    sharejs = require('./sharejs')(config),
    auth = require('./auth'),
    file = require('./file');

var app = express();
var server = http.createServer(app);

auth.init(config.get('user_files'));

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
app.use('/api/sharejs',sharejs);
app.use(bodyParser.json());

app.post('/api/login', function (req, res) {
    auth.login(req.body.user, req.body.password)
    .then(function(token) {
        var path = config.get('user_files')+'/'+req.body.user;
        fs.readFile(path+'/settings.yml', function(err, data) {
            var settings;
            if (!err) { settings = yaml.safeLoad(data); }
            fs.readFile(path+'/projects.yml', function(error, data) {
                res.send({ok: true, token:token, projects: yaml.safeLoad(data),
                         settings:settings});
            });
        });
    }).catch(function(error) {
        res.send({ok: false, error:error});
    });
});

app.post('/api/file/new/:us/:project/*', function (req, res) {
    // TODO permissions
    var userpath = config.get('user_files')+'/'+req.params.us;
    file.new(userpath, req.params.project+'/'+req.params[0])
    .then(function(files) {
            // TODO files in subdirs
            var projfile = userpath+'/projects.yml';
            projects = yaml.safeLoad(fs.readFileSync(projfile));
            var files = projects[req.params.project].files;
            files[req.params[0].substr(1)] = { type: 'javascript' };
            fs.writeFileSync(projfile, yaml.safeDump(projects));
        res.send({ok: true, files:files});
    }).catch(function(error) {
        console.log(error);
        res.send({ok: false, error:error});
    });
});
app.post('/api/file/delete/:us/:project/*', function(req, res) {
    // TODO permissions
    var userpath = config.get('user_files')+'/'+req.params.us;
    file.delete(config.get('user_files')+'/'+req.params.us, req.params.project+'/'+req.params[0])
    .then(function(files) {
            // TODO files in subdirs
            var projfile = userpath+'/projects.yml';
            projects = yaml.safeLoad(fs.readFileSync(projfile));
            var files = projects[req.params.project].files;
            delete files[req.params[0].substr(1)];
            fs.writeFileSync(projfile, yaml.safeDump(projects));
        res.send({ok: true, files:files});
    }).catch(function(error) {
        console.log(error);
        res.send({ok: false, error:error});
    });
});

app.use('/', express.static('.'));

server.listen(config.get('server.port'), config.get('server.hostname'));
