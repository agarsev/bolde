"use strict";

var api = require('./api');

var respath = require('../utils/path');

var load = function (user, project, path) {
    var fullpath = user + '/' + project + '/' + path;
    return new Promise(function (resolve, reject) {
        if (window.FileStore.isLoaded(fullpath)) {
            resolve(window.FileStore.getFile(fullpath).type);
        } else {
            api.call('api/sharejs/open/', {user,project,path})
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
                                user, project, path, doc,
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

exports.keepalive = function (fullpaths) {
    api.call('api/sharejs/keepalive', {paths: fullpaths});
};

exports.open = function (user, project, path) {
    load(user, project, path).then((type) =>
        window.Dispatcher.dispatch({
          actionType: 'file.open',
          type, user, project, path
        }));
};

exports.close = function (user, project, path) {
    window.Dispatcher.dispatch({
        actionType: 'file.close',
        user, project, path
    });
};

exports.new = function(user, project, path, type) {
    return api.call('api/file/new', {user, project, path, type });
};

exports.new_at_selected = function (user, project, filename, type) {
    var dir = window.ProjectStore.get(user, project).cwd;
    if (!dir) { dir = ''; }
    else { dir += '/'; }
    exports.new(user, project, dir+filename, type);
};

exports.delete = function (user, project, path) {
    return api.call('api/file/delete', { user, project, path });
};

exports.put = function (fullpath, content) {
    var parts = respath.parse(fullpath),
        user = parts[1],
        project = parts[2],
        path = parts[3];
    exports.new(user, project, path)
    .then(() => load(user, project, path))
    .then(function () {
        window.Dispatcher.dispatch({
            actionType: 'file.put',
            user, project, path, content
        });
    });
};

var copyPath;
exports.copy = function (user, project, file) {
    copyPath = user+'/'+project+'/'+file;
};

exports.paste_at_selected = function (user, project, path) {
    var dir = window.ProjectStore.get(user, project).cwd;
    if (!dir) { dir = ''; }
    else { dir += '/'; }
    var fullpath = user+'/'+project+'/'+dir+path;
    return api.call('api/file/copy', {from: copyPath, to: fullpath});
};
