"use strict";

var EventEmitter = require('events').EventEmitter;
var Actions = require('../Actions');

class ToolStore extends EventEmitter {

    constructor () {
        super();

        this.tools = {};
        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'login':
                    this.addTool('_settings', 'Settings', () => false, true);
                    break;
                case 'logout':
                    window.ProjectStore.getAll()
                        .forEach(name => this.removeTool('Proj_'+name));
                    this.removeTool('_settings');
                    break;
                case 'add_tool':
                    this.addTool(a.id, a.title, a.click, a.right);
                    break;
                case 'add_menu':
                    this.addMenu(a.id, a.title, a.menu, a.right);
                    break;
                case 'remove_tool':
                    this.removeTool(a.id);
                    break;
                case 'open_project':
                    this.addMenu('Proj_'+a.name, a.name, [
                        {title:'New file',click: function () {
                            var filename = prompt('New file name:');
                            if (!filename || filename.length<1) { return; }
                            Actions.new_file(window.UserStore.getUser()
                                             +'/'+a.name+'/'+filename);
                        }},
                        {title:'Run',click: function() {
                            Actions.run(window.UserStore.getUser()+'/'+a.name);
                        }}
                    ]);
                    break;
                case 'close_project':
                    this.removeTool('Proj_'+a.name);
                    break;
            }
        });
    }

    getTools (right) {
        return Object.keys(this.tools)
            .filter(id => this.tools[id].right == right)
            .map(id => this.tools[id]);
    }

    addTool (id, title, click, right) {
        if (right === undefined) { right = false; }
        this.tools[id] = { title: title,
                click: click,
                right: right };
        this.emit('changed');
    }

    addMenu (id, title, menu, right) {
        if (right === undefined) { right = false; }
        this.tools[id] = { title: title,
                menu: menu,
                right: right };
        this.emit('changed');
    }

    removeTool (id) {
        delete this.tools[id];
        this.emit('changed');
    }

};

module.exports = ToolStore;
