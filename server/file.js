var express = require('express'),
    log4js = require('log4js');

var store = require('./store');
var path = require('../src/utils/path');

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
        var res, name = path;
        while (res = /^([^\/]+)\/(.+)$/.exec(name)) {
            files = files[res[1]].files;
            name = res[2];
        }
        files[name] = { type: type };
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
        var res, name = path;
        while (res = /^([^\/]+)\/(.+)$/.exec(name)) {
            files = files[res[1]].files;
            name = res[2];
        }
        delete files[name];
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
    var from = path.parse(req.body.from),
        to = path.parse(req.body.to);
    var nufiles, type;
    store.copyFile(req.body.from, req.body.to)
    .then(function () {
        return Promise.all([store.load(from[1], from[2], 'files')
                          ,store.load(to[1], to[2], 'files')]);
    }).then(function (files) {
        var fromfiles = files[0], tofiles = files[1];
        nufiles = tofiles;
        var res, old = from[3], nu = to[3];
        while (res = /^([^\/]+)\/(.+)$/.exec(old)) {
            fromfiles = fromfiles[res[1]].files;
            old = res[2];
        }
        type = fromfiles[old].type;
        while (res = /^([^\/]+)\/(.+)$/.exec(nu)) {
            tofiles = tofiles[res[1]].files;
            nu = res[2];
        }
        tofiles[nu] = { type: type };
        return store.write(nufiles, to[1], to[2], 'files');
    }).then(function () {
        log.info('copy file '+req.body.from+' to '+req.body.to);
        res.send({ok: true, data:{files:nufiles}});
    }).catch(function(error) {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

module.exports = Router;
