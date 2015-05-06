"use strict";

var api = require('./actions/api');

exports.project = require('./actions/Project');
exports.tab = require('./actions/Tab');
exports.toolbar = require('./actions/Toolbar');
exports.file = require('./actions/File');
exports.engine = require('./actions/Engine');

exports.login = function (user, password) {
    api.call('api/login', {user:user, password:password})
    .then(function(data){
        window.Dispatcher.dispatch({
            actionType: 'login',
            user: user,
            token: data.token,
            projects: data.projects,
            settings: data.settings
        });
    });
};

exports.logout = function () {
    window.Dispatcher.dispatch({
        actionType: 'logout'
    });
};

exports.changeSettings = function (settings) {
    api.call('api/settings/update', {user:window.UserStore.getUser(), settings})
    .then(function(data) {
        window.Dispatcher.dispatch({
            actionType: 'changeSettings',
            settings
        });
    });
};
