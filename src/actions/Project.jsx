"use strict";

var yaml = require('js-yaml');

var api = require('./api');

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
            project: { user, name }
        });
    }).catch(error => api.log(error));
};

exports.update_description = function (user, name, desc) {
    api.call('api/project/update', { user, project: name, desc })
    .catch(error => api.log(error));
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
    api.loading(true);
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
        pro.chain(conf.connect, pipeline => Pipeline.run(project, pipeline));
    }).catch (function (error) {
        api.loading(false);
        api.log(error);
    });
};

exports.share = function (user, project, shared) {
    api.call('api/project/share', { user, project, shared })
    .then(function (data) {
        window.Dispatcher.dispatch({
            actionType: 'project.update_share',
            user, project, shared
        });
    }).catch(error => api.log(error));
}

exports.restore = function (formdata) {
    api.call('api/project/restore', formdata, true)
    .then(function (proj) {
        window.Dispatcher.dispatch({
            actionType: 'project.new',
            project: proj
        });
    }).catch(error => api.log(error));
}
