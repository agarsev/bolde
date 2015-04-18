var React = require('react');
var Stapes = require('stapes');

var Actions = require('./Actions');
var MDText = require('./MDText');
var ProjectView = require('./ProjectView');
var Editor = require('./Editor');

var TabStore = Stapes.subclass({
    constructor: function () {
        this.tabs = {};
        this.selected = [ -1, -1, -1 ];

        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'open_message':
                    this.openMessage(a.title, a.text, a.links);
                    break;
                case 'open_tab':
                    this.addTab(a.id, a.title, a.node);
                    break;
                case 'close_tab':
                    this.closeTab(a.id);
                    break;
                case 'move_tab_panel':
                    this.moveTab(a.tab, a.panel);
                    break;
                case 'focus_tab':
                    this.focusTab(a.id);
                    break;
                case 'login':
                    var list = "Welcome back, "+a.user+"\n## Your Projects\n";
                    Object.keys(a.projects).forEach(p => {
                        list += "- ["+p+"](#"+p+")\n";
                    });
                    this.openMessage("Projects", list, name => Actions.open_project(name));
                    break;
                case 'logout':
                    window.ProjectStore.getAll()
                        .forEach(name => this.closeProjectView(name));
                    this.closeTab('message_Projects');
                    break;
                case 'open_project':
                    if (this.tabs['projv_'+a.name]) {
                        this.focusTab('projv_'+a.name);
                    } else {
                        this.addTab('projv_'+a.name, a.name, <ProjectView project={a.name} />, 0,
                                    () => { Actions.close_project(a.name); return false; }
                        );
                    }
                    break;
                case 'close_project':
                    this.closeProjectView(a.name);
                    break;
                case 'open_file':
                    if (this.tabs['file_'+a.filename]) {
                        this.focusTab('file_'+a.filename);
                    } else {
                        this.addTab('file_'+a.filename,
                             a.filename.substr(a.filename.search(/\/[^\/]+$/)+1),
                             <Editor filename={a.filename} />
                        );
                    }
                    break;
            }
        });
    },
    openMessage: function (title, text, links) {
        this.addTab('message_'+title, title, { node: <MDText text={text} links={links} /> });
    },
    addTab: function (id, title, node, panel, closeCallback) {
        if (panel === undefined) { panel = 1; }
        this.tabs[id] = { id: id, title: title, panel: panel, node: node,
            closecb: closeCallback };
        this.selected[panel] = id;
        this.emit('changed');
    },
    getShouldClose: function (id) {
        return this.tabs[id].closecb;
    },
    getTab: function (id) {
        return this.tabs[id];
    },
    closeTab: function (id) {
        if (this.tabs[id] === undefined) { return; }
        var panel = this.tabs[id].panel;
        delete this.tabs[id];
        if (this.selected[panel] == id) {
            this.unselect(panel);
        }
        this.emit('changed');
    },
    getTabs: function (panel) {
        return Object.keys(this.tabs)
            .filter(id => this.tabs[id].panel == panel)
            .map(id => {
                var ret = this.tabs[id];
                ret.selected = this.selected[panel] == id;
                return ret;
            });
    },
    moveTab: function (id, panel) {
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
    },
    focusTab: function (id) {
        var tab = this.tabs[id];
        this.selected[tab.panel] = id;
        this.emit('changed');
    },
    unselect: function (panel) {
        if(!Object.keys(this.tabs).some(function(id) {
            if (this.tabs[id].panel == panel) {
                this.selected[panel] = id;
                return true;
            }
        }, this)) {
            this.selected[panel] = -1;
        };
    },
    closeProjectView: function (name) {
        Object.keys(this.tabs)
            .filter(id => id.match('^file_[^/]*\\/'+name))
            .forEach(id => this.closeTab(id));
        this.closeTab('projv_'+name);
        this.emit('changed');
    }
});

module.exports = TabStore;
