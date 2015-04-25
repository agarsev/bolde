"use strict";

exports.add_menu = function (id, title, menu, right) {
    window.Dispatcher.dispatch({
        actionType: 'toolbar.add_menu',
        id: id,
        title: title,
        menu: menu,
        right: right
    });
};

exports.add = function (id, title, click, right) {
    window.Dispatcher.dispatch({
        actionType: 'toolbar.add',
        id: id,
        title: title,
        click: click,
        right: right
    });
};

exports.remove = function (id) {
    window.Dispatcher.dispatch({
        actionType: 'toolbar.remove',
        id: id
    });
};
