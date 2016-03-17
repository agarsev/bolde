"use strict";

var api = require('./api');
var progress = require('./progress');

var sses = {};

var login = function (user, password) {
    var prg = progress.start('Logging in '+user);
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
        var sse = new EventSource('api/user/sse/'+user);
        sse.onmessage = function (event) {
            data = JSON.parse(event.data);
            window.Dispatcher.dispatch(data);
        };
        sses[user] = sse;
        progress.stop(prg);
    }).catch(function(error){
        window.Dispatcher.dispatch({
            actionType: 'user.loginFail',
            error
        });
        progress.stop(prg);
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
    var us = window.UserStore.getUser();
    sses[us].close();
    delete sses[us];
    window.Dispatcher.dispatch({
        actionType: 'user.logout'
    });
};

exports.changeSettings = function (settings) {
    var prg = progress.start('Changing settings');
    api.call('api/user/settings', {user:window.UserStore.getUser(), settings})
    .then(function(data) {
        window.Dispatcher.dispatch({
            actionType: 'user.changeSettings',
            settings
        });
        progress.stop(prg);
    }).catch(error => {
        progress.stop(prg);
        api.log(error);
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

exports.openPList = function () {
    var prg = progress.start('Loading projects');
    var user = window.UserStore.getUser();
    api.call('api/project/all', {user})
    .then(projects => {
        window.Dispatcher.dispatch({
            actionType: 'user.open_plist', user, projects
        });
        progress.stop(prg);
    }).catch(error => {
        progress.stop(prg);
        api.log(error);
    });
};
