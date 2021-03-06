"use strict";

var yaml = require('js-yaml');

var api = require('./api');
var progress = require('./progress');

var load = require('./File').load;
var Pipeline = require('./Pipeline');

var pro = require('utils/promises');

exports.open = function (user, name) {
    api.call('api/project/files', { user, project: name })
    .then(function (data) {
        window.Dispatcher.dispatch({
            actionType: 'project.open',
            user, name,
            files: data.files
        });
    });
};

exports.close = function (user, name) {
    window.Dispatcher.dispatch({
        actionType: 'project.close',
        user,name
    });
};

exports.delete = function (name) {
    var user = window.UserStore.getUser();
    exports.close(user, name);
    api.call('api/project/delete', { user, project: name })
    .catch(error => api.log(error));
};

exports.clone = function (user, source, dest) {
    var me = window.UserStore.getUser();
    api.call('api/project/clone', { from: { user, project:source },
             to: { user:me, project:dest } })
    .then(function(project) {
        window.Dispatcher.dispatch({
            actionType: 'project.new',
            project
        });
    }).catch(error => api.log(error));
};

exports.new = function (name) {
    var user = window.UserStore.getUser();
    api.call('api/project/new', { user, project: name })
    .then(function() {
        window.Dispatcher.dispatch({
            actionType: 'project.new',
            project: { user, name, shared: [] }
        });
    }).catch(error => api.log(error));
};

exports.update_description = function (user, name, desc) {
    api.call('api/project/update', { user, project: name, desc })
    .catch(error => api.log(error));
};

exports.publish = function (project, make_public) {
    var user = window.UserStore.getUser();
    api.call('api/project/publish', { user, project, make_public })
    .then(() => {
        window.Dispatcher.dispatch({
            actionType: 'project.publish',
            user, project, make_public
        });
    }).catch(error => api.log(error));
};

exports.select_dir = function (user, project, path) {
    window.Dispatcher.dispatch({
        actionType: 'project.select_dir',
        user, project, path
    });
};

exports.select_file = function (user, project, path) {
    window.Dispatcher.dispatch({
        actionType: 'project.select_file',
        user, project, path
    });
};

exports.run = function (user, project) {
    var conf;
    var prg = progress.start('Running '+project);
    load(user, project, 'run.yml')
    .then (function () {
        conf = yaml.safeLoad(window.FileStore.getContents(user, project, 'run.yml'));
        conf.connect.forEach(pipeline => pipeline.forEach(element => {
            if (element.files !== undefined && !element['_files_have_been_processed']) {
                element['_files_have_been_processed'] = true;
                Object.keys(element.files).forEach(name => {
                    element.files[name] = user+'/'+project+'/'+element.files[name];
                });
            }
        }));
        return pro.chain(conf.connect, pipeline => Pipeline.run(project, pipeline));
    }).then(() => progress.stop(prg))
    .catch (function (error) {
        progress.stop(prg);
        api.log(error);
    });
};

exports.share = function (user, project, shared) {
    var prg = progress.start('Sharing '+project);
    api.call('api/project/share', { user, project, shared })
    .then(function (data) {
        window.Dispatcher.dispatch({
            actionType: 'project.update_share',
            user, project, shared
        });
        progress.stop(prg);
    }).catch(error => {
        progress.stop(prg);
        api.log(error);
    });
}

exports.restore = function (formdata) {
    var prg = progress.start('Restoring project');
    api.call('api/project/restore', formdata, true)
    .then(function (proj) {
        window.Dispatcher.dispatch({
            actionType: 'project.new',
            project: proj
        });
        progress.stop(prg);
    }).catch(error => {
        progress.stop(prg);
        api.log(error);
    });
}
