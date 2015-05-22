"use strict";

var api = require('./actions/api');

exports.project = require('./actions/Project');
exports.tab = require('./actions/Tab');
exports.toolbar = require('./actions/Toolbar');
exports.file = require('./actions/File');
exports.engine = require('./actions/Engine');
exports.treebank = require('./actions/Treebank');

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
    }).catch(function(error){
        api.log(error);
        window.Dispatcher.dispatch({
            actionType: 'loginFail',
            error
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

exports.clearLogs = function (name) {
    window.Dispatcher.dispatch({
        actionType: 'log.clear',
        name
    });
};

exports.output = function (name, results) {
    window.Dispatcher.dispatch({
        actionType: 'output',
        name, results
    });
};
