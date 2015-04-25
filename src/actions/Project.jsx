"use strict";

var $ = require('jquery');

exports.open = function (name) {
    window.Dispatcher.dispatch({
        actionType: 'project.open',
        name: name
    });
};

exports.close = function (name) {
    window.Dispatcher.dispatch({
        actionType: 'project.close',
        name: name
    });
};

exports.delete = () => console.log('unimplemented');

exports.new = function (name) {
    $.ajax({
        method: 'POST',
        url: 'api/project/new/'+name,
        contentType: 'application/json',
        data: JSON.stringify({token: window.UserStore.getToken()}),
        success: function(data) {
            if (data.ok) {
                window.Dispatcher.dispatch({
                    actionType: 'project.new',
                    name
                });
            } else {
                console.log(data.error);
            }
        }
    });
};

exports.update_description = function (name, desc) {
    window.Dispatcher.dispatch({
        actionType: 'project.update_description',
        name, desc
    });
};
