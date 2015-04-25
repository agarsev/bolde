"use strict";

var $ = require('jquery');
var yaml = require('js-yaml');

exports.project = require('./actions/Project');
exports.tab = require('./actions/Tab');
exports.toolbar = require('./actions/Toolbar');
exports.file = require('./actions/File');

exports.login = function (user, password) {
    $.ajax({
        method: 'POST',
        url: "api/login/",
        data: JSON.stringify({user:user, password:password}),
        contentType: 'application/json',
        success: function(data) {
            if (data.ok) {
                window.Dispatcher.dispatch({
                    actionType: 'login',
                    user: user,
                    token: data.token,
                    projects: data.projects
                });
            } else {
                console.log(data.error);
            }
        }
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
