"use strict";

var yaml = require('js-yaml');

var load = require('./File').load;

window.URL = window.URL || window.webkitURL;

module.exports = function (project) {
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
            var blob = new Blob([body], {type: 'application/javascript'});
            var worker = new Worker(URL.createObjectURL(blob));
            worker.onmessage = function (msg) {
                window.Dispatcher.dispatch({
                    actionType: 'run',
                    project: project,
                    type: conf.output,
                    data: msg.data
                });
            };
            worker.postMessage(input);
        });
    })
    .catch (function (error) {
        console.log(error);
    });
};
