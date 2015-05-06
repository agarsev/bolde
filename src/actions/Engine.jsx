"use strict";

var yaml = require('js-yaml');

var load = require('./File').load;
var loading = require('./api').loading;

window.URL = window.URL || window.webkitURL;

var workers = {};

function start (engine) {
    if (workers[engine] === undefined) {
        var w = new Worker('build/engines/'+engine+'.js');
        w.onmessage = function (e) {
            var msg = e.data;
            if (msg.event === 'output') {
                // TODO use conf.output to know what to do with this
                window.Dispatcher.dispatch({
                    actionType: 'log.new',
                    name: msg.name,
                    msg: msg.data.msg,
                    detail: msg.data.detail
                });
            } else if (msg.event === 'finish') {
                // TODO improve knowing who's running
                loading(false);
            }
        };
        workers[engine] = w;
    }
}
exports.start = start;

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
        var w = workers[conf.engine];
        w.postMessage({ event: 'config', name: project, data: conf.config });
        w.postMessage({ event: 'input', name: project, data: window.FileStore.getContents(project+'/'+conf.input) });
    }).catch (function (error) {
        loading(false);
        console.log(error);
    });
};
