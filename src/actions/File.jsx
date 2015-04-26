"use strict";

var api = require('./api');

exports.new = function (path) {
    api.call('api/file/new/'+path, {token: window.UserStore.getToken()})
    .then(function(data) {
        window.Dispatcher.dispatch({
            actionType: 'file.new',
            filename: path
        });
    });
};

exports.delete = function (path) {
    api.call('api/file/delete/'+path, {token: window.UserStore.getToken()})
    .then(function(data) {
        window.Dispatcher.dispatch({
            actionType: 'file.delete',
            filename: path
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

exports.open = function (path) {
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
