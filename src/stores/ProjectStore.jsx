"use strict";

var EventEmitter = require('events').EventEmitter;

class ProjectStore extends EventEmitter {

    constructor () {
        super();

        this.projects = {};
        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'user.login':
                    this.projects = {[a.user]:{}};
                    a.projects.own.forEach(p => {
                        this.projects[a.user][p.name] = p;
                    });
                    a.projects.shared.forEach(p => {
                        if (this.projects[p.user]===undefined) {
                            this.projects[p.user] = {[p.name]: p};
                        } else {
                            this.projects[p.user][p.name] = p;
                        }
                    });
                    this.emit('changed');
                    break;
                case 'user.logout':
                    window.Dispatcher.waitFor([
                        window.TabStore.dispatchToken,
                        window.ToolStore.dispatchToken
                    ]);
                    this.projects = {};
                    this.emit('changed');
                    break;
                case 'file.new':
                    this.projects[a.user][a.project].files.push(a.file);
                    this.emit(`changed:${a.user}/${a.project}`);
                    break;
                case 'file.delete':
                    this.projects[a.user][a.project].files = a.files;
                    this.emit(`changed:${a.user}/${a.project}`);
                    break;
                case 'project.open':
                    this.projects[a.user][a.name].files = a.files;
                    break;
                case 'project.new':
                    this.projects[a.user][a.name] = {
                        user: a.user,
                        name: a.name
                    };
                    this.emit('changed');
                    break;
                case 'project.delete':
                    delete this.projects[a.user][a.name];
                    this.emit('changed');
                    break;
                case 'project.clone':
                    this.projects[a.user][a.name] = a.project;
                    this.emit('changed');
                    break;
                case 'project.update_description':
                    this.projects[a.user][a.name].desc = a.desc;
                    this.emit(`changed:${a.user}/${a.name}`);
                    break;
                case 'project.update_share':
                    this.projects[a.user][a.name].shared = a.shared;
                    this.emit(`changed:${a.user}/${a.name}`);
                    break;
                case 'project.select_dir':
                    this.projects[a.user][a.project].cwd = a.path;
                    break;
                case 'project.select_file':
                    this.projects[a.user][a.project].cwd = a.path.substr(0, a.path.lastIndexOf('/'));
                    break;
            }
        });
    }

    get (user, name) {
        return this.projects[user][name];
    }

    getAll () {
        return this.projects;
    }

};

module.exports = ProjectStore;
