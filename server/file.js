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
        type = req.body.type === 'grammar' ? 'json': 'text',
        fullname = user+'/'+project+'/'+path;
    var nufiles;
    store.newFile(fullname)
    .then(function () {
        return store.load(user, project, 'files');
    }).then(function (files) {
        nufiles = files;
        var p = { files: files, path: path };
        Path.navigate(p);
        p.files[p.path] = { type: type };
        return store.write(nufiles, user, project, 'files');
    }).then(function () {
        log.info('new file '+fullname);
        res.send({ok: true, data:{files:nufiles}});
    }).catch(function(error) {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/delete', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        path = req.body.path,
        fullname = user+'/'+project+'/'+path;
    var nufiles;
    store.deleteFile(fullname)
    .then(function () {
        return store.load(user, project, 'files');
    }).then(function (files) {
        nufiles = files;
        var p = { files: files, path: path };
        Path.navigate(p);
        delete p.files[p.path];
        return store.write(nufiles, user, project, 'files');
    }).then(function () {
        log.info('deleted file '+fullname);
        res.send({ok: true, data:{files:nufiles}});
    }).catch(function(error) {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/copy', function (req, res) {
    var from = Path.parse(req.body.from),
        to = Path.parse(req.body.to);
    var nufiles, type;
    store.copyFile(req.body.from, req.body.to)
    .then(function () {
        return Promise.all([store.load(from[1], from[2], 'files')
                          ,store.load(to[1], to[2], 'files')]);
    }).then(function (files) {
        var fromp = {files: files[0], path: from[3]};
        Path.navigate(fromp);
        var top = {files: files[1], path: to[3]};
        nufiles = top.files;
        Path.navigate(top);
        type = fromp.files[fromp.path].type;
        top.files[top.path] = { type: type };
        return store.write(nufiles, to[1], to[2], 'files');
    }).then(function () {
        log.info('copy file '+req.body.from+' to '+req.body.to);
        res.send({ok: true, data:{files:nufiles,type:type}});
    }).catch(function(error) {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

module.exports = Router;
