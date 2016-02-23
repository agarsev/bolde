"use strict";

var api = require('./actions/api');

exports.project = require('./actions/Project');
exports.tab = require('./actions/Tab');
exports.toolbar = require('./actions/Toolbar');
exports.file = require('./actions/File');
exports.engine = require('./actions/Engine');
exports.treebank = require('./actions/Treebank');
exports.user = require('./actions/User');

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

exports.prompt = function (form, msg) {
    var res, rej;
    var r = new Promise(function(resolve, reject) {
        res = resolve; rej = reject;
    });
    window.Dispatcher.dispatch({
        actionType: 'prompt.in',
        form, msg, resolve: res, reject: rej
    });
    return r;
};

exports.clearPrompt = function () {
    window.Dispatcher.dispatch({
        actionType: 'prompt.out'
    });
};
