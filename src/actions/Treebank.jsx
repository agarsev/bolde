"use strict";

exports.new = function (name) {
    window.Dispatcher.dispatch({
        actionType: 'treebank.new',
        name
    });
};

exports.store = function (name, trees) {
    if (!window.TreebankStore.exists(name)) {
        exports.new(name);
    }
    window.Dispatcher.dispatch({
        actionType: 'treebank.store',
        name, trees
    });
};

exports.open = function (name) {
    window.Dispatcher.dispatch({
        actionType: 'treebank.open',
        name
    });
};
