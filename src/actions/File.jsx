"use strict";

var api = require('./api');
var progress = require('./progress');

var respath = require('../utils/path');

var load = function (user, project, path) {
    if (project === undefined) {
        var parts = respath.parse(user),
            user = parts[1],
            project = parts[2],
            path = parts[3];
    }
    return new Promise(function (resolve, reject) {
        if (window.FileStore.isLoaded(user, project, path)) {
            resolve(window.FileStore.getFile(user, project, path).type);
        } else {
            var prg = progress.start('Load '+path);
            api.call('api/sharejs/open/', {user,project,path})
            .then(function(data) {

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
                        progress.stop(prg);
                    });
            }).catch(error => {
                api.syslog(error);
                progress.stop(prg);
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
    var prg = progress.start('New file '+path);
    return api.call('api/file/new', {user, project, path, type })
    .then(() => progress.stop(prg))
    .catch(error => {
        api.syslog(error);
        progress.stop(prg);
    });
};

exports.new_at_selected = function (user, project, filename, type) {
    var dir = window.ProjectStore.get(user, project).cwd;
    if (!dir) { dir = ''; }
    else { dir += '/'; }
    exports.new(user, project, dir+filename, type);
};

exports.delete = function (user, project, path) {
    var prg = progress.start('Delete '+path);
    return api.call('api/file/delete', { user, project, path })
    .then(() => progress.stop(prg))
    .catch(error => {
        api.syslog(error);
        progress.stop(prg);
    });
};

exports.put = function (fullpath, content) {
    var parts = respath.parse(fullpath),
        user = parts[1],
        project = parts[2],
        path = parts[3];
    exports.new(user, project, path, 'text')
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
    var prg = progress.start('Copy '+path);
    var dir = window.ProjectStore.get(user, project).cwd;
    if (!dir) { dir = ''; }
    else { dir += '/'; }
    var fullpath = user+'/'+project+'/'+dir+path;
    return api.call('api/file/copy', {from: copyPath, to: fullpath})
    .then(() => progress.stop(prg))
    .catch(error => {
        api.syslog(error);
        progress.stop(prg);
    });
};
