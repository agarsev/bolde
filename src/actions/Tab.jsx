"use strict";

exports.new_msg = function (title, text, links) {
    window.Dispatcher.dispatch({
        actionType: 'tab.new_msg',
        title: title,
        text: text,
        links: links
    });
};

exports.open = function (id, title, node, panel, cb) {
    window.Dispatcher.dispatch({
        actionType: 'tab.open',
        id, title, node, panel, cb
    });
};

exports.close = function (tabid) {
    window.Dispatcher.dispatch({
        actionType: 'tab.close',
        id: tabid
    });
};

exports.move_to_panel = function (tabid, panel) {
    window.Dispatcher.dispatch({
        actionType: 'tab.move_to_panel',
        tab: tabid,
        panel: panel
    });
};

exports.focus = function (tabid) {
    window.Dispatcher.dispatch({
        actionType: 'tab.focus',
        id: tabid
    });
};

exports.openSettings = function () {
    window.Dispatcher.dispatch({
        actionType: 'tab.openSettings'
    });
};
