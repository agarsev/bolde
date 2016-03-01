"use strict";

var api = require('./api');

var login = function (user, password) {
    api.call('api/user/login', {user:user, password:password})
    .then(function(data){
        window.Dispatcher.dispatch({
            actionType: 'user.login',
            user: user,
            token: data.token,
            projects: data.projects,
            settings: data.settings
        });
    }).catch(function(error){
        window.Dispatcher.dispatch({
            actionType: 'user.loginFail',
            error
        });
    });
};
exports.login = login;

exports.register = function (user, password) {
    api.call('api/user/new', {user:user, password:password})
    .then(function() { return login(user, password); })
    .catch(function(error){
        window.Dispatcher.dispatch({
            actionType: 'user.loginFail',
            error
        });
    });
};

exports.logout = function () {
    window.Dispatcher.dispatch({
        actionType: 'user.logout'
    });
};

exports.changeSettings = function (settings) {
    api.call('api/user/settings', {user:window.UserStore.getUser(), settings})
    .then(function(data) {
        window.Dispatcher.dispatch({
            actionType: 'user.changeSettings',
            settings
        });
    });
};

