var express = require('express'),
    log4js = require('log4js');

var store = require('./store');
var notify = require('./user').notify;
var db = require('./db');
var Path = require('../src/utils/path');

var log = log4js.getLogger('file');

var Router = new express.Router();

function action_new (user, project, path, type) {
    return { actionType: 'file.new',
        user, project, file: { path, type }};
}

Router.post('/new', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        path = req.body.path,
        type = req.body.type,
        fullname = user+'/'+project+'/'+path;
    (type=='dir'?store.newDir(fullname):store.newFile(fullname))
    .then(() => db.file.new(user,project,path,type))
    .then(() => {
        log.info('new '+(type=='dir'?'directory':'file')
                 +' '+fullname);
        res.send({ok: true, data:{}});
    }).then(() => db.project.allmembers(user,project))
    .then(users => notify(users, action_new(user, project, path, type))
    ).catch(error => {
        log.warn(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/delete', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        path = req.body.path,
        fullname = user+'/'+project+'/'+path,
        files;
    store.deleteFile(fullname)
    .then(() => db.file.remove(user,project,path))
    .then(() => db.file.all(user,project))
    .then(fs => {
        files = fs;
        log.info('deleted file '+fullname);
        res.send({ok: true, data:{} });
    }).then(() => db.project.allmembers(user,project))
    .then(users => {
        notify(users, { actionType: 'file.close',
            user, project, path });
        notify(users, { actionType: 'project.files',
            user, project, files });
    }).catch(error => {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/copy', function (req, res) {
    var from = Path.parse(req.body.from),
        to = Path.parse(req.body.to),
        type;
    store.copyFile(req.body.from, req.body.to)
    .then(() => db.file.get(from[1],from[2],from[3]))
    .then(file => {
        type = file.type;
        return db.file.new(to[1],to[2],to[3],file.type);
    }).then(() => {
        log.info('copy file '+req.body.from+' to '+req.body.to);
        res.send({ok: true, data:{}});
    }).then(() => db.project.allmembers(user,project))
    .then(users => notify(users, action_new(user, project, path, type))
    ).catch(error => {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

module.exports = Router;
