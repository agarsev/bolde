"use strict";

var EventEmitter = require('events').EventEmitter;

class ProjectStore extends EventEmitter {

    constructor () {
        super();

        this.projects = {};
        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'login':
                    this.projects = a.projects;
                    Object.keys(this.projects).forEach(p => {
                        if (!this.projects[p]) { this.projects[p] = {} }
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
                case 'file.new':
                    this.projects[a.project].files = a.files;
                    this.emit('changed:'+a.project);
                    break;
                case 'file.delete':
                    this.projects[a.project].files = a.files;
                    this.emit('changed:'+a.project);
                    break;
                case 'project.open':
                    this.projects[a.name].files = a.files;
                    break;
                case 'project.new':
                    this.projects[a.name] = {
                        user: window.UserStore.getUser(),
                        name: a.name
                    };
                    this.emit('changed');
                    break;
                case 'project.update_description':
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
