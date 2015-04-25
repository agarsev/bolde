"use strict";

var EventEmitter = require('events').EventEmitter;

class ProjectStore extends EventEmitter {

    constructor () {
        super();

        this.projects = {};
        window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'login':
                    this.projects = a.projects;
                    Object.keys(this.projects).forEach(p => {
                        this.projects[p].user = a.user;
                        this.projects[p].name = p;
                    });
                    this.emit('changed');
                    break;
                case 'logout':
                    window.Dispatcher.waitFor([
                        window.TabStore.dispatchToken,
                        window.ToolStore.dispatchToken
                    ]);
                    this.projects = {};
                    this.emit('changed');
                    break;
                case 'new_file':
                    var r = /^([^/]+)\/([^/]+)\/(.+)$/.exec(a.filename);
                    this.projects[r[2]].files[r[3]] = 'text';
                    this.emit('changed:'+r[2]);
                    break;
                case 'delete_file':
                    var r = /^([^/]+)\/([^/]+)\/(.+)$/.exec(a.filename);
                    delete this.projects[r[2]].files[r[3]];
                    this.emit('changed:'+r[2]);
                    break;
                case 'update_project_description':
                    this.projects[a.name].desc = a.desc;
                    this.emit('changed:'+[a.name]);
                    break;
            }
        });
    }

    get (name) {
        return this.projects[name];
    }

    getAll () {
        return Object.keys(this.projects);
    }

};

module.exports = ProjectStore;
