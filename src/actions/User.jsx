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
            settings: data.settings,
            messages: data.messages
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

exports.message = function (to, subject, text) {
    api.call('api/user/message', {from:window.UserStore.getUser(), to, subject, text})
    .then(function(messages) {
        window.Dispatcher.dispatch({
            actionType: 'user.messages',
            messages
        });
    }).catch(function(error) {
        api.log(error);
    });
};

exports.clearConversation = function (to, subject) {
    api.call('api/user/clearmessages', {from:window.UserStore.getUser(), to, subject})
    .then(function(messages) {
        window.Dispatcher.dispatch({
            actionType: 'user.messages',
            messages
        });
    }).catch(function(error) {
        api.log(error);
    });
};
