"use strict";

var EventEmitter = require('events').EventEmitter;
var Actions = require('../Actions');

var t = require('tcomb-form');

class ToolStore extends EventEmitter {

    constructor () {
        super();

        this.loading = false;

        var newTB = { title: 'New', click: () => console.log('Not implemented') };
        var tbtool = {
            title: 'Treebank',
            menu: [ ],
            order: 2,
            right: false
        };

        this.tools = {};

        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'login':
                    this.addTool('_settings', 'Settings', () => Actions.tab.openSettings(), true);
                    break;
                case 'logout':
                    window.ProjectStore.getAll()
                        .forEach(name => this.removeTool('Proj_'+name));
                    this.removeTool('_settings');
                    break;
                case 'toolbar.add':
                    this.addTool(a.id, a.title, a.click, a.right);
                    break;
                case 'toolbar.add_menu':
                    this.addMenu(a.id, a.title, a.menu, a.right);
                    break;
                case 'toolbar.remove':
                    this.removeTool(a.id);
                    break;
                case 'loading.start':
                    this.loading = true;
                    this.emit('changed');
                    break;
                case 'loading.end':
                    this.loading = false;
                    this.emit('changed');
                    break;
                case 'treebank.new':
                    window.Dispatcher.waitFor([window.TreebankStore.dispatchToken]);
                    if (this.tools['_treebanks'] === undefined) {
                        this.tools['_treebanks'] = tbtool;
                    }
                    this.tools['_treebanks'].menu = window.TreebankStore.getTreebanks().map(name => {
                            return { title: name, click: Actions.treebank.open.bind(null,name) };
                        });
                    this.emit('changed');
                    break;
            }
        });
    }

    getTools (right) {
        return Object.keys(this.tools)
            .filter(id => this.tools[id].right == right)
            .sort((a, b) => this.tools[a].order > this.tools[b].order )
            .map(id => this.tools[id]);
    }

    addTool (id, title, click, right, order) {
        if (right === undefined) { right = false; }
        if (order === undefined) { order = 1; }
        this.tools[id] = { title, click, right, order };
        this.emit('changed');
    }

    addMenu (id, title, menu, right, order) {
        if (right === undefined) { right = false; }
        if (order === undefined) { order = 1; }
        this.tools[id] = { title, menu, right, order };
        this.emit('changed');
    }

    removeTool (id) {
        delete this.tools[id];
        this.emit('changed');
    }

    isLoading () { return this.loading; }

};

module.exports = ToolStore;
