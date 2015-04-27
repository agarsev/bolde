"use strict";

var api = require('./api');

exports.new = function (user, project, path) {
    api.call('api/file/new', {user: user, project: project, path: path })
    .then(function(data) {
        window.Dispatcher.dispatch({
            actionType: 'file.new',
            user: user,
            project: project,
            path: path,
            files: data.files
        });
    });
};

exports.delete = function (user, project, path) {
    api.call('api/file/delete', {user: user, project: project, path: path})
    .then(function(data) {
        window.Dispatcher.dispatch({
            actionType: 'file.delete',
            user: user,
            project: project,
            path: path,
            files: data.files
        });
    });
};

var load = function (path) {
    return new Promise(function (resolve, reject) {
        if (window.FileStore.isLoaded(path)) {
            resolve();
        } else {
            api.call('api/sharejs/open/', {file: path})
            .then(function(data) {
                window.BCSocket = require("share/node_modules/browserchannel/dist/bcsocket.js").BCSocket;
                require("share/webclient/share.js");
                require("share/webclient/ace.js");

                sharejs.open(data.name, 'text',
                             location.href.substr(0, location.href.search(/\/[^\/]*$/))+'/api/sharejs/channel',
                             function(error, doc) {
                                 if (error) { reject(error); }
                                 else {
                                     window.Dispatcher.dispatch({
                                         actionType: 'file.load',
                                         filename: path,
                                         doc,
                                         mode: data.mode
                                     });
                                     resolve();
                                 }
                             });
            });
        }
    });
};
exports.load = load;

exports.open = function (user, project, file) {
    var path = user + '/' + project + '/' + file;
    load(path).then(() =>
        window.Dispatcher.dispatch({
          actionType: 'file.open',
          filename: path
        }));
};

exports.close = function (filename) {
    window.Dispatcher.dispatch({
        actionType: 'file.close',
        filename: filename
    });
};
