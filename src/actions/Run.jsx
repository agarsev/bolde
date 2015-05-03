"use strict";

var yaml = require('js-yaml');

var load = require('./File').load;

window.URL = window.URL || window.webkitURL;

module.exports = function (project) {
    load(project+'/run.yml')
    .then (function () {
        var conf = yaml.safeLoad(window.FileStore.getContents(project+'/run.yml'));
        if (!!conf.engine) {
            var worker = new Worker('build/'+conf.engine+'.js');
            return Promise.all([load(project+'/'+conf.grammar), load(project+'/'+conf.input)])
            .then(function () {
                var grammar = window.FileStore.getContents(project+'/'+conf.grammar);
                var input = window.FileStore.getContents(project+'/'+conf.input);
                worker.onmessage = function (msg) {
                    window.Dispatcher.dispatch({
                        actionType: 'run',
                        project: project,
                        type: conf.output,
                        data: msg.data
                    });
                };
                worker.postMessage({ channel: 'grammar', grammar });
                worker.postMessage({ channel: 'input', input });
            });
        } else {
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
        }
    })
    .catch (function (error) {
        console.log(error);
    });
};
