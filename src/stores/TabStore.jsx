"use strict";

var EventEmitter = require('events').EventEmitter;
var React = require('react');

var Actions = require('../Actions');

var MDText = require('../components/MDText');
var ProjectView = require('../components/ProjectView');
var ProjectList = require('../components/ProjectList');
var Editor = require('../components/Editor');
var AVM = require('../components/AVM');

class TabStore extends EventEmitter {

    constructor () {
        super();

        this.tabs = {};
        this.selected = [ -1, -1, -1 ];

        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'tab.new_msg':
                    this.openMessage(a.title, a.text, a.links);
                    break;
                case 'tab.open':
                    this.addTab(a.id, a.title, a.node);
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
                case 'login':
                    this.addTab('_ProjectList', 'Projects', <ProjectList />, 1);
                    break;
                case 'logout':
                    window.ProjectStore.getAll()
                        .forEach(name => this.closeProjectView(name));
                    this.closeTab('_ProjectList');
                    break;
                case 'project.open':
                    if (this.tabs['projv_'+a.name]) {
                        this.focusTab('projv_'+a.name);
                    } else {
                        this.addTab('projv_'+a.name, a.name, <ProjectView project={a.name} />, 0,
                                    () => { Actions.project.close(a.name); return false; }
                        );
                    }
                    break;
                case 'project.close':
                    this.closeProjectView(a.name);
                    break;
                case 'file.open':
                    if (this.tabs['file_'+a.filename]) {
                        this.focusTab('file_'+a.filename);
                    } else {
                        this.addTab('file_'+a.filename,
                             a.filename.substr(a.filename.search(/\/[^\/]+$/)+1),
                             <Editor filename={a.filename} />
                        );
                    }
                    break;
                case 'file.delete':
                    this.closeTab('file_'+a.filename);
                    break;
                case 'run':
                    var project = a.project.substr(a.project.search(/\/[^\/]+$/)+1);
                    this.addTab('run_'+a.project,project+' results',
                                a.type=='avm'?
                                <div className="Tab"><AVM data={a.data} /></div>:
                                <MDText text={a.data} />,
                                2);
                    break;
            }
        });
    }

    openMessage (title, text, links) {
        this.addTab('message_'+title, title, { node: <MDText text={text} links={links} /> });
    }

    addTab (id, title, node, panel, closeCallback) {
        if (panel === undefined) { panel = 1; }
        this.tabs[id] = { id: id, title: title, panel: panel, node: node,
            closecb: closeCallback };
        this.selected[panel] = id;
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
