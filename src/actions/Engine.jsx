"use strict";

var yaml = require('js-yaml');

var load = require('./File').load;
var loading = require('./api').loading;

window.URL = window.URL || window.webkitURL;

var engines = {};

function start (engine) {
    if (engines[engine] === undefined) {
        var w = new Worker('engines/'+engine+'.js');
        var eng = { w, feed: {} };
        w.onmessage = function (e) {
            var m = e.data;
            switch (m.event) {
            case 'input':
                eng.feed[m.name](m.counter).then(function (data) {
                    w.postMessage({ event: 'input', name: m.name, counter: m.counter, data });
                }).catch(function () {
                    w.postMessage({ event: 'end', name: m.name, counter: m.counter });
                });
                break;
            case 'output':
                // TODO
                break;
            case 'log':
                window.Dispatcher.dispatch({
                    actionType: 'log.new',
                    name: m.name,
                    level: m.level,
                    message: m.message,
                });
                break;
            case 'finish':
                // TODO
                loading(false);
                break;
            };
        };
        engines[engine] = eng;
    }
}

function newWorker (engine, name, config, feed) {
    engines[engine].feed[name] = feed;
    engines[engine].w.postMessage({
        event: 'new', name, config
    });
}

exports.run = function (project) {
    var conf;
    loading(true);
    load(project+'/run.yml')
    .then (function () {
        // load all dependencies
        conf = yaml.safeLoad(window.FileStore.getContents(project+'/run.yml'));
        start(conf.engine);
        // TODO multiple input files + console input
        var allfiles = [ conf.input ];
        if (typeof conf.config === 'string') {
            allfiles.push(conf.config);
        } else if (conf.config.files) {
            var files = conf.config.files;
            allfiles = allfiles.concat(Object.keys(files).map(name => files[name]));
        }
        return Promise.all(allfiles.map(file => load(project+'/'+file)));
    }).then (function () {
        if (typeof conf.config === 'string') {
            conf.config = window.FileStore.getContents(project+'/'+conf.config);
        } else if (conf.config.files) {
            var files = conf.config.files;
            Object.keys(files).forEach(name => {
                files[name] = window.FileStore.getContents(project+'/'+files[name]);
            });
        }
        var lines = window.FileStore.getContents(project+'/'+conf.input).split('\n');
        newWorker(conf.engine, project, conf.config, function (i) {
            if (i>lines.length) {
                return Promise.reject();
            } else {
                return Promise.resolve(lines[i]);
            }
        });
    }).catch (function (error) {
        loading(false);
        console.log(error);
    });
};
