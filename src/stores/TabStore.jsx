"use strict";

var EventEmitter = require('events').EventEmitter;
var Actions = require('../Actions');
var Components = require('../Components');

class TabStore extends EventEmitter {

    constructor () {
        super();

        this.tabs = {};
        this.selected = [ -1, -1, -1 ];

        var id = 0;

        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'tab.new_msg':
                    this.openMessage(a.title, a.text, a.links);
                    break;
                case 'tab.open':
                    this.addTab(a.id, a.title, a.node, a.panel);
                    break;
                case 'tab.close':
                    this.closeTab(a.id);
                    break;
                case 'tab.move_to_panel':
                    this.moveTab(a.tab, a.panel);
                    break;
                case 'tab.focus':
                    this.focusTab(a.id);
                    break;
                case 'user.login':
                    this.tabs['_UserTab'].title = 'User: '+a.user;
                    this.addTab('_ProjectList', 'Projects', Components.ProjectList(), 1);
                    break;
                case 'user.logout':
                    this.tabs['_UserTab'].title = 'Anonymous User';
                    window.ProjectStore.getAll()
                        .forEach(name => this.closeProjectView(name));
                    this.closeTab('_ProjectList');
                    this.closeTab('_settings');
                    break;
                case 'project.open':
                    window.Dispatcher.waitFor([window.ProjectStore.dispatchToken]);
                    var tabname = `projv_${a.user}/${a.name}`;
                    if (this.tabs[tabname]) {
                        this.focusTab(tabname);
                    } else {
                        this.addTab(tabname, a.name,
                            Components.ProjectView(a.user, a.name), 0,
                            () => { Actions.project.close(a.user, a.name);
                                    return false; }
                        );
                    }
                    break;
                case 'project.close':
                    this.closeProjectView(a.name);
                    break;
                case 'file.open':
                    var fullpath = a.user + '/' + a.project + '/' + a.path;
                    if (this.tabs['file_'+fullpath]) {
                        this.focusTab('file_'+fullpath);
                    } else {
                        this.addTab('file_'+fullpath,
                             fullpath.substr(fullpath.search(/\/[^\/]+$/)+1),
                             a.type=='text'?Components.Editor(fullpath):Components.VisualEditor(fullpath),
                             1,
                             () => { Actions.file.close(a.user, a.project, a.path); return true; }
                        );
                    }
                    break;
                case 'file.close':
                    this.closeTab('file_'+a.user+'/'+a.project+'/'+a.path);
                    break;
                case 'file.put':
                    if (this.tabs['file_'+a.path]) {
                        this.closeTab('file_'+a.path);
                        window.Dispatcher.waitFor([window.FileStore.dispatchToken]);
                        this.addTab('file_'+a.path,
                            a.path.substr(a.path.search(/\/[^\/]+$/)+1),
                            Components.Editor(a.path)
                        );
                    }
                    break;
                case 'log.new':
                    var project = a.name.substr(a.name.search(/\/[^\/]+$/)+1);
                    window.Dispatcher.waitFor([window.LogStore.dispatchToken]);
                    if (this.tabs['log_'+a.name]) {
                        this.focusTab('log_'+a.name);
                    } else {
                        this.addTab('log_'+a.name, project+" log", Components.LogView(a.name), 2);
                    }
                    break;
                case 'tab.openSettings':
                    this.addTab('_settings', 'Settings',
                        Components.Form('User Settings', Actions.changeSettings, window.UserStore.getSettingsForm.bind(window.UserStore)));
                    break;
                case 'output':
                    var tn = 'output_'+a.name;
                    if (this.tabs[tn]) {
                        this.updateTab(tn, Components.TBView(a.results, true));
                    } else {
                        this.addTab(tn, a.name+' results', Components.TBView(a.results, true), 1);
                    }
                    break;
                case 'treebank.open':
                    this.addTab('treebank_'+(id++), a.name, Components.TBView(a.name), 1);
                    break;
            }
        });
    }

    openMessage (title, text, links) {
        this.addTab('message_'+title, title, { node: Components.MDText(text, links) });
    }

    addTab (id, title, node, panel, closeCallback) {
        if (panel === undefined) { panel = 1; }
        this.tabs[id] = { id: id, title: title, panel: panel, node: node,
            closecb: closeCallback };
        this.selected[panel] = id;
        this.emit('changed');
    }

    updateTab(id, node) {
        this.tabs[id].node = node;
        this.emit('changed');
    }

    getShouldClose (id) {
        return this.tabs[id].closecb;
    }

    getTab (id) {
        return this.tabs[id];
    }

    closeTab (id) {
        if (this.tabs[id] === undefined) { return; }
        var panel = this.tabs[id].panel;
        delete this.tabs[id];
        if (this.selected[panel] == id) {
            this.unselect(panel);
        }
        this.emit('changed');
    }

    getTabs (panel) {
        return Object.keys(this.tabs)
            .filter(id => this.tabs[id].panel == panel)
            .map(id => {
                var ret = this.tabs[id];
                ret.selected = this.selected[panel] == id;
                return ret;
            });
    }

    moveTab (id, panel) {
        var tab = this.tabs[id];
        if (tab.panel != panel) {
            var oldpanel = tab.panel;
            tab.panel = panel;
            this.selected[panel] = id;
            this.unselect(oldpanel);
            this.emit('changed');
        } else if (this.selected[panel] != id) {
            this.selected[panel] = id;
            this.emit('changed');
        }
    }

    focusTab (id) {
        var tab = this.tabs[id];
        this.selected[tab.panel] = id;
        this.emit('changed');
    }

    unselect (panel) {
        if(!Object.keys(this.tabs).some(function(id) {
            if (this.tabs[id].panel == panel) {
                this.selected[panel] = id;
                return true;
            }
        }, this)) {
            this.selected[panel] = -1;
        };
    }

    closeProjectView (name) {
        Object.keys(this.tabs)
            .filter(id => id.match('^file_[^/]*\\/'+name))
            .forEach(id => this.closeTab(id));
        this.closeTab('projv_'+name);
        this.emit('changed');
    }

};

module.exports = TabStore;
