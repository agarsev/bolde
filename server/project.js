var express = require('express'),
    log4js = require('log4js');

var store = require('./store');

var log = log4js.getLogger('project');

var Router = new express.Router();

Router.post('/files', function (req, res) {
    var project = req.body.project,
        user = req.body.user;
    store.findall({ type: 'file', owner: user, project: project })
    .then(files => {
        res.send({ok: true, data: { files: files }});
    }).catch(error => {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/new', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        doc = {
            type: 'project',
            owner: user,
            name: project,
            desc: ''
        };
    store.insert(doc)
    .then(() => store.newDir(user+'/'+project))
    .then(() => {
        log.info('created project '+user+'/'+project);
        res.send({ok: true, data: {}});
    }).catch(error => {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/update', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        desc = req.body.desc;
    store.update({ type: 'project', owner: user, name: project },
        { $set: { desc: desc } })
    .then(() => {
        res.send({ok: true, data: {}});
    }).catch(error => {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/delete', function (req, res) {
    var user = req.body.user,
        project = req.body.project;
    store.deleteFolder(user+'/'+project)
    .then(() => {
        store.remove({ type: 'project', owner: user, name: project });
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
    .then(() => store.find({ type: 'project', owner: user, name: source }))
    .then(project => {
        proj = JSON.parse(JSON.stringify(project));
        delete proj._id;
        proj.name = dest;
        return store.insert(proj);
    }).then(() => {
        log.info('cloned project '+user+'/'+source+' to '+user+'/'+dest);
        res.send({ok: true, data: proj});
    }).catch(error => {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

module.exports = Router;
