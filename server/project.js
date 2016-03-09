var express = require('express'),
    log4js = require('log4js');

var store = require('./store');
var notify = require('./user').notify;
var db = require('./db');

var log = log4js.getLogger('project');

var Router = new express.Router();

Router.post('/files', function (req, res) {
    var project = req.body.project,
        user = req.body.user;
    db.file.all(user, project)
    .then(files => {
        res.send({ok: true, data: { files }});
    }).catch(error => {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/new', function (req, res) {
    var user = req.body.user,
        project = req.body.project;
    store.newDir(user+'/'+project)
    .then(() => db.project.new(user,project,''))
    .then(() => {
        log.info('created project '+user+'/'+project);
        res.send({ok: true});
    }).catch(error => {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/update', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        desc = req.body.desc;
    db.project.setdesc(user,project,desc)
    .then(() => res.send({ok: true, data: {}}))
    .then(() => db.project.allmembers(user,project))
    .then(users => notify(users, {
            actionType: 'project.update_description',
            user, name:project, desc }))
    .catch(error => {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/delete', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        members;
    store.deleteFolder(user+'/'+project)
    .then(() => db.project.allmembers(user,project))
    .then(users => { members = users; })
    .then(() => db.project.remove(user, project))
    .then(() => {
        log.info('deleted project '+user+'/'+project);
        res.send({ok: true, data: {}});
    }).then(() => notify(mebers, {
            actionType: 'project.delete',
            user,name:project }))
    .catch(function(error) {
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
    .then(() => db.project.copy(user, source, user, dest))
    .then(() => {
        log.info('cloned project '+user+'/'+source+' to '+user+'/'+dest);
        res.send({ok: true, data: proj});
    }).catch(error => {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/share', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        shared = req.body.shared;
    db.project.updateshare(user, project, shared)
    .then(() => db.project.get(user, project))
    .then(proj => {
        res.send({ok: true, data: {shared}});
        notify(shared, { actionType: 'project.newshare',
               user, name: project, desc: proj.desc
        });
    }).catch(error => {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

module.exports = Router;
