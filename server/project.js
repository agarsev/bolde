var express = require('express'),
    log4js = require('log4js');

var store = require('./store');

var log = log4js.getLogger('project');

var Router = new express.Router();

Router.post('/files', function (req, res) {
    store.load(req.body.project, 'files')
    .then(function(files) {
        res.send({ok: true, data:{ files: files }});
    }).catch(function(error) {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/new', function (req, res) {
    var user = req.body.user,
        project = req.body.project;
    store.write({}, user, project, 'files')
    .then(function() {
        return store.load(user, 'projects');
    }).then(function(projects) {
        projects[project] = { desc: '' };
        return store.write(projects, user, 'projects');
    }).then(function() {
        log.info('created project '+user+'/'+project);
        res.send({ok: true, data: {}});
    }).catch(function(error) {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/update', function (req, res) {
    store.load(req.body.user, 'projects')
    .then(function(projects) {
        projects[req.body.project].desc = req.body.desc;
        return store.write(projects, req.body.user, 'projects');
    }).then(function() {
        res.send({ok: true, data: {}});
    }).catch(function(error) {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/delete', function (req, res) {
    var user = req.body.user,
        project = req.body.project;
    store.deleteFolder(user+'/'+project)
    .then(function() {
        return store.load(user, 'projects');
    }).then(function(projects) {
        delete projects[project];
        return store.write(projects, user, 'projects');
    }).then(function() {
        log.info('deleted project '+user+'/'+project);
        res.send({ok: true, data: {}});
    }).catch(function(error) {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/clone', function (req, res) {
    var user = req.body.user,
        source = req.body.source,
        dest = req.body.dest,
        proj;
    store.copyFolder(user+'/'+source, user+'/'+dest)
    .then(function() {
        return store.load(user, 'projects');
    }).then(function(projects) {
        proj = JSON.parse(JSON.stringify(projects[source]));
        projects[dest] = proj;
        return store.write(projects, user, 'projects');
    }).then(function() {
        log.info('cloned project '+user+'/'+source+' to '+user+'/'+dest);
        res.send({ok: true, data: proj});
    }).catch(function(error) {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

module.exports = Router;
