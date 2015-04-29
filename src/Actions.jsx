"use strict";

var yaml = require('js-yaml');

var api = require('./actions/api');
exports.project = require('./actions/Project');
exports.tab = require('./actions/Tab');
exports.toolbar = require('./actions/Toolbar');
exports.file = require('./actions/File');

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

exports.run = function (project) {
    var load = exports.file.load;
    load(project+'/run.yml')
    .then (function () {
        var conf = yaml.safeLoad(window.FileStore.getContents(project+'/run.yml'));
        var allfiles = conf.deps.map(file => load(project+'/'+file));
        allfiles.push(load(project+'/'+conf.run));
        allfiles.push(load(project+'/'+conf.input));
        return Promise.all(allfiles).then(function () {
            var body = conf.deps.reduce((body, file) => body+";"+window.FileStore.getContents(project+'/'+file), '');
            body += window.FileStore.getContents(project+'/'+conf.run);
            var input = window.FileStore.getContents(project+'/'+conf.input);
            var run = new Function('input', 'output', 'log', body);
            run(input, function(data) {
                window.Dispatcher.dispatch({
                    actionType: 'run',
                    project: project,
                    type: conf.output,
                    data: data
                });
            }, (channel, data) => console.log(channel+': '+data));
        });
    })
    .catch (function (error) {
        console.log(error);
    });
};
