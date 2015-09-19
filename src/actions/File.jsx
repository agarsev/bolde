"use strict";

var api = require('./api');

var respath = require('../utils/path');

var load = function (path) {
    return new Promise(function (resolve, reject) {
        if (window.FileStore.isLoaded(path)) {
            resolve(window.FileStore.getFile(path).type);
        } else {
            api.call('api/sharejs/open/', {file: path})
            .then(function(data) {
                api.loading(true);

                window.BCSocket = require("share/node_modules/browserchannel/dist/bcsocket.js").BCSocket;
                require("share/webclient/share.js");
                require('share/webclient/ace.js');
                require('share/webclient/json.js');
                sharejs.open(data.name, data.type,
                    location.href.substr(0, location.href.search(/\/[^\/]*$/))+'/api/sharejs/channel',
                    function(error, doc) {
                        if (error) { reject(error); }
                        else {
                            window.Dispatcher.dispatch({
                                actionType: 'file.load',
                                filename: path,
                                doc,
                                type: data.type,
                                mode: data.mode
                            });
                            resolve(data.type);
                        }
                        api.loading(false);
                    });
            });
        }
    });
};
exports.load = load;

exports.keepalive = function (paths) {
    api.call('api/sharejs/keepalive', {paths});
};

exports.open = function (user, project, file) {
    var path = user + '/' + project + '/' + file;
    load(path).then((type) =>
        window.Dispatcher.dispatch({
          actionType: 'file.open',
          filename: path,
          type: type,
          user: user,
          project: project,
          file: file
        }));
};

exports.close = function (user, project, file) {
    window.Dispatcher.dispatch({
        actionType: 'file.close',
        user: user,
        project: project,
        file: file
    });
};

exports.new = function(user, project, path, type) {
    return api.call('api/file/new', {user, project, path, type })
    .then(function(data) {
        window.Dispatcher.dispatch({
            actionType: 'file.new',
            user: user,
            project: project,
            path: path,
            files: data.files,
            type: type
        });
    });
};

exports.new_at_selected = function (user, project, filename, type) {
    var dir = window.ProjectStore.get(project).cwd;
    if (!dir) { dir = ''; }
    else { dir += '/'; }
    exports.new(user, project, dir+filename, type);
};

exports.delete = function (user, project, path) {
    exports.close(user, project, path);
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

exports.put = function (path, content) {
    var parts = respath.parse(path);
    exports.new(parts[1], parts[2], parts[3])
    .then(load.bind(null, path))
    .then(function () {
        window.Dispatcher.dispatch({
            actionType: 'file.put',
            path, content
        });
    });
};

var copyPath;

exports.copy = function (user, project, file) {
    copyPath = user+'/'+project+'/'+file;
};

exports.paste_at_selected = function (user, project, filename) {
    var dir = window.ProjectStore.get(project).cwd;
    if (!dir) { dir = ''; }
    else { dir += '/'; }
    var path = user+'/'+project+'/'+dir+filename;
    return api.call('api/file/copy', {from: copyPath, to: path})
    .then(function(data) {
        window.Dispatcher.dispatch({
            actionType: 'file.new',
            user: user,
            project: project,
            path: path,
            files: data.files,
            type: data.type
        });
    });
};
