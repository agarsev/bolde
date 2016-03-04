var express = require('express'),
    log4js = require('log4js');

var store = require('./store');
var Path = require('../src/utils/path');

var log = log4js.getLogger('file');

var Router = new express.Router();

Router.post('/new', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        path = req.body.path,
        type = req.body.type,
        fullname = user+'/'+project+'/'+path;
    (type=='dir'?store.newDir(fullname):store.newFile(fullname))
    .then(() => store.insert({ type: 'file',
            owner: user,
            project: project,
            path: path,
            type: type
        }))
    .then(() => {
        log.info('new '+(type=='dir'?'directory':'file')
                 +' '+fullname);
        res.send({ok: true});
    }).catch(error => {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/delete', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        path = req.body.path,
        fullname = user+'/'+project+'/'+path;
    store.deleteFile(fullname)
    .then(() => store.remove({ type: 'file', owner: user,
            project: project,
            path: new Regexp('(^'+path+'$)|(^'+path+'/.*)')
        }, { multi: true }))
    .then(() => store.findall({ type: 'file', owner: user, project: project }))
    .then(files => {
        log.info('deleted file '+fullname);
        res.send({ok: true, files:files });
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
    .then(() => store.find({ type: 'file', owner: from[1],
        project: from[2], path: from[3] }))
    .then(file => {
        delete file._id;
        file.owner = to[1];
        file.project = to[2];
        file.path = to[3];
        type = file.type;
        return store.insert(file);
    }).then(() => {
        log.info('copy file '+req.body.from+' to '+req.body.to);
        res.send({ok: true, type:type});
    }).catch(error => {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

module.exports = Router;
