var express = require('express'),
    log4js = require('log4js');

var store = require('./store');

var log = log4js.getLogger('file');

var Router = new express.Router();

Router.post('/new', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        path = req.body.path;
    var nufiles;
    store.newFile(user, project, path)
    .then(function () {
        return store.load(user, project, 'files');
    }).then(function (files) {
        nufiles = files;
        var res, name = path;
        while (res = /^([^\/]+)\/(.+)$/.exec(name)) {
            files = files[res[1]].files;
            name = res[2];
        }
        // TODO mode detection
        files[name] = { type: 'javascript' };
        return store.write(nufiles, user, project, 'files');
    }).then(function () {
        log.info('new file '+user+'/'+project+'/'+path);
        res.send({ok: true, data:{files:nufiles}});
    }).catch(function(error) {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/delete', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        path = req.body.path;
    var nufiles;
    store.deleteFile(user, project, path)
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
        log.info('deleted file '+user+'/'+project+'/'+path);
        res.send({ok: true, data:{files:nufiles}});
    }).catch(function(error) {
        applog.warn(error);
        res.send({ok: false, error:error});
    });
});

module.exports = Router;
