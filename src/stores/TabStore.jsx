var React = require('react');
var Stapes = require('stapes');

var MDText = require('./MDText');

var default_panel = {
    'DirTree': 0,
};

var TabStore = Stapes.subclass({
    constructor: function (mount) {
        this.tabs = {};
        this.selected = [ -1, -1, -1 ];
        this.counter = 0;

        window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'login':
                    var list = "Welcome back, "+a.user+"\n## Your Projects\n";
                    Object.keys(a.projects).forEach(p => {
                        a.projects[p].user = user;
                        a.projects[p].name = p;
                        list += "- ["+p+"](#"+p+")\n";
                    });
                    this.openMessage(list, name => Actions.open_project(name));
                case 'open_message':
                    this.openMessage(a.text, a.links);
                    break;
                case 'close_tab':
                    this.closeTab(a.id);
                    break;
                case 'move_tab_panel':
                    this.moveTab(a.tab, a.panel);
                    break;
                case 'focus_tab':
                    var tab = this.tabs[a.id];
                    this.selected[tab.panel] = a.id;
                    this.emit('changed');
                    break;
            }
        });
    },
    openMessage: function (title, text, links) {
        this.addTab(this.counter++, title, { node: <MDText text={text} links={links} /> });
    },
    addTab: function (id, title, node) {
        this.tabs[id] = { id: id, title: title, panel: 1, node: node };
        this.selected[1] = id;
        this.emit('changed');
    },
    getTab: function (id) {
        return this.tabs[id];
    },
    closeTab: function (id) {
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
    unselect: function (panel) {
        if(!Object.keys(this.tabs).some(function(id) {
            if (this.tabs[id].panel == panel) {
                this.selected[panel] = id;
                return true;
            }
        }, this)) {
            this.selected[panel] = -1;
        };
    }
});

module.exports = TabStore;
