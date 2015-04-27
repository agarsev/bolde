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

exports.delete = () => console.log('unimplemented');

exports.new = function (name) {
    api.call('api/project/new/', { user: window.UserStore.getUser(), project: name })
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
