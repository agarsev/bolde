"use strict";

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

exports.new = () => console.log('unimplemented');

exports.update_description = function (name, desc) {
    window.Dispatcher.dispatch({
        actionType: 'project.update_description',
        name, desc
    });
};
