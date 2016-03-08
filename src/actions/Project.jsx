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
    .then(function() {
        window.Dispatcher.dispatch({
            actionType: 'project.delete',
            user,name
        });
    }).catch(function(error) {
        api.log(data.error);
    });
};

// TODO NEW ARCH FOR SHARING
exports.clone = function (source, dest) {
    var user = window.UserStore.getUser();
    api.call('api/project/clone', { user, source, dest })
    .then(function(project) {
        window.Dispatcher.dispatch({
            actionType: 'project.clone',
            user, name: dest, project
        });
    }).catch(function(error) {
        api.log(data.error);
    });
};

exports.new = function (name) {
    var user = window.UserStore.getUser();
    api.call('api/project/new', { user, project: name })
    .then(function() {
        window.Dispatcher.dispatch({
            actionType: 'project.new',
            user, name
        });
    }).catch(function(error) {
        api.log(data.error);
    });
};

exports.update_description = function (user, name, desc) {
    api.call('api/project/update', { user, project: name, desc })
    .then(function () {
        window.Dispatcher.dispatch({
            actionType: 'project.update_description',
            user, name, desc
        });
    }).catch(function(error) {
        api.log(data.error);
    });
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

// TODO NEW ARCH FOR SHARING
exports.run = function (project) {
    var conf;
    api.loading(true);
    load(project+'/run.yml')
    .then (function () {
        conf = yaml.safeLoad(window.FileStore.getContents(project+'/run.yml'));
        conf.connect.forEach(pipeline => pipeline.forEach(element => {
            if (element.files !== undefined && !element['_files_have_been_processed']) {
                element['_files_have_been_processed'] = true;
                Object.keys(element.files).forEach(name => {
                    element.files[name] = project+'/'+element.files[name];
                });
            }
        }));
        pro.chain(conf.connect, pipeline => Pipeline.run(project, pipeline));
    }).catch (function (error) {
        api.loading(false);
        api.log(error);
    });
};
