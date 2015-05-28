var express = require('express'),
    log4js = require('log4js');

var store = require('./store');

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

module.exports = Router;
