"use strict";

var api = require('./api.jsx');

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
    window.Dispatcher.dispatch({
        actionType: 'project.update_description',
        name, desc
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
