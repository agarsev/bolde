"use strict";

var $ = require('jquery');

exports.new = function (path) {
    $.ajax({
        method: 'POST',
        url: 'api/file/new/'+path,
        contentType: 'application/json',
        data: JSON.stringify({token: window.UserStore.getToken()}),
        success: function(data) {
            if (data.ok) {
                window.Dispatcher.dispatch({
                    actionType: 'file.new',
                    filename: path
                });
            } else {
                console.log(data.error);
            }
        }
    });
};

exports.delete = function (path) {
    $.ajax({
        method: 'POST',
        url: 'api/file/delete/'+path,
        contentType: 'application/json',
        data: JSON.stringify({token: window.UserStore.getToken()}),
        success: function(data) {
            if (data.ok) {
                window.Dispatcher.dispatch({
                    actionType: 'file.delete',
                    filename: path
                });
            } else {
                console.log(data.error);
            }
        }
    });
};

var load = function (path) {
    return new Promise(function (resolve, reject) {
        if (window.FileStore.isLoaded(path)) {
            resolve();
        } else {
            $.ajax({
                url: "api/sharejs/open/"+path,
                success: function(data) {
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
                        }
                    );
                }
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
