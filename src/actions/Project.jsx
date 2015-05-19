"use strict";

var yaml = require('js-yaml');

var api = require('./api');

var load = require('./File').load;
var Pipeline = require('./Pipeline');

exports.open = function (name) {
    api.call('api/project/files', { project: window.UserStore.getUser()+'/'+name })
    .then(function (data) {
        window.Dispatcher.dispatch({
            actionType: 'project.open',
            name: name,
            files: data.files
        });
    });
};

exports.close = function (name) {
    window.Dispatcher.dispatch({
        actionType: 'project.close',
        name: name
    });
};

exports.delete = function (name) {
    exports.close(name);
    api.call('api/project/delete', { user: window.UserStore.getUser(), project: name })
    .then(function() {
        window.Dispatcher.dispatch({
            actionType: 'project.delete',
            name
        });
    }).catch(function(error) {
        console.log(data.error);
    });
};

exports.new = function (name) {
    api.call('api/project/new', { user: window.UserStore.getUser(), project: name })
    .then(function() {
        window.Dispatcher.dispatch({
            actionType: 'project.new',
            name
        });
    }).catch(function(error) {
        console.log(data.error);
    });
};

exports.update_description = function (name, desc) {
    api.call('api/project/update', { user: window.UserStore.getUser(), project: name, desc })
    .then(function () {
        window.Dispatcher.dispatch({
            actionType: 'project.update_description',
            name, desc
        });
    }).catch(function(error) {
        console.log(data.error);
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

exports.run = function (project) {
    var conf;
    api.loading(true);
    load(project+'/run.yml')
    .then (function () {
        conf = yaml.safeLoad(window.FileStore.getContents(project+'/run.yml'));
        conf.pipeline.forEach(element => {
            if (element.files !== undefined) {
                Object.keys(element.files).forEach(name => {
                    element.files[name] = project+'/'+element.files[name];
                });
            }
        });
        return Pipeline.run(project, conf.pipeline);
    }).then (function () {
        api.loading(false);
    }).catch (function (error) {
        api.loading(false);
        console.log(error);
    });
};
