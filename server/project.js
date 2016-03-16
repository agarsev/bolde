var express = require('express'),
    log4js = require('log4js'),
    AdmZip = require('adm-zip'),
    multer = require('multer');

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

Router.post('/publish', function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        make_public = req.body.make_public;
    db.project.setpublic(user,project,make_public)
    .then(() => res.send({ok: true, data: {}}))
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
    }).then(() => notify(members, {
            actionType: 'project.delete',
            user,name:project }))
    .catch(function(error) {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

Router.post('/clone', function (req, res) {
    var from = req.body.from,
        to = req.body.to;
    store.copyFolder(from.user+'/'+from.project,
                     to.user+'/'+to.project)
    .then(() => db.project.copy(from.user, from.project,
                                to.user, to.project))
    .then(() => db.project.get(to.user, to.project))
    .then(proj => {
        log.info('cloned project '+from.user+'/'+from.project
                 +' to '+to.user+'/'+to.project);
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
        notify(shared, { actionType: 'project.new',
               project: proj });
    }).catch(error => {
        log.error(error);
        res.send({ok: false, error:error});
    });
});

// monkey-patching AdmZip
function newZip () {
    zip = new AdmZip(...arguments);
    zip._monkey_addFile = zip.addFile;
    zip.addFile = function(filename, data, comment) {
        zip._monkey_addFile(filename, data, comment, 0o666 << 16);
    }
    return zip;
}

Router.get('/backup/:user/:project', function (req, res) {
    var user = req.params.user,
        project = req.params.project,
        zip = newZip();
    zip.addLocalFolder(store.realpath(user+'/'+project), 'files');
    db.project.backup(user, project)
    .then(docs => {
        zip.addFile('project.db', new Buffer(JSON.stringify(docs)));
        var buf = zip.toBuffer();
        res.setHeader('Content-disposition', 'attachment; filename='+project+'.zip');
        res.contentType('zip');
        res.write(buf);
        res.end();
    });
});

var upload = multer({storage:multer.memoryStorage()});

Router.post('/restore', upload.single('zip'), function (req, res) {
    var user = req.body.user,
        project = req.body.project,
        path = user+'/'+project,
        zip = newZip(req.file.buffer)
        docs = null;
    var pr = new Promise(function (resolve, reject) {
        zip.extractAllTo(store.realpath(path+'.tmp'), true);
        resolve(JSON.parse(zip.readAsText('project.db')));
    }).then(docs => db.project.restore(user, project, docs))
    .then(() => store.move(path+'.tmp/files',path))
    .then(() => store.deleteFile(path+'.tmp'))
    .then(() => db.project.get(user, project))
    .then(proj => {
        log.info('Restored project '+user+'/'+project);
        res.send({ok: true, data: proj});
    }).catch(error => {
        log.error(error);
        res.send({ok: false, error});
    });
});

module.exports = Router;
