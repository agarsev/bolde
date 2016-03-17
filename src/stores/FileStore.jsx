"use strict";

var EventEmitter = require('events').EventEmitter;
var Actions = require('../Actions');

function fullpath (action) {
    return action.user+'/'+action.project+'/'+action.path;
}

function resolvepath (userOrFullpath, project, path) {
    if (project === undefined) {
        return userOrFullpath;
    } else {
        return userOrFullpath+'/'+project+'/'+path;
    }
}

class FileStore extends EventEmitter {

    constructor () {
        super();

        this.files = {};
        this.keepalive = setInterval(this.keepalive.bind(this), 5000);

        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'file.load':
                    var proj = window.ProjectStore.get(a.user, a.project);
                    this.files[fullpath(a)] = {
                        doc: a.doc,
                        mode: a.mode,
                        type: a.type,
                        readonly: proj.readonly
                    };
                    break;
                case 'file.delete':
                case 'file.close':
                    var path = fullpath(a);
                    if (this.files[path]) {
                        this.files[path].doc.close();
                        delete this.files[path];
                    }
                    break;
                case 'file.put':
                    var f = this.files[fullpath(a)];
                    if (f.type !== 'text') {
                        throw 'Trying to write to non-text file';
                    }
                    var doc = f.doc;
                    doc.del(0, doc.getText().length);
                    doc.insert(0, a.content);
                    break;
                case 'user.logout':
                    for (path in this.files) {
                        this.files[path].doc.close();
                    }
                    this.files = {};
                    break;
            }
        });
    }

    isLoaded () {
        return resolvepath(...arguments) in this.files;
    }

    getFile () {
        return this.files[resolvepath(...arguments)];
    }

    getContents () {
        var f = this.files[resolvepath(...arguments)];
        if (f.type === 'text') {
            return f.doc.getText();
        } else {
            return f.doc.get();
        }
    }

    keepalive () {
        var f = Object.keys(this.files);
        if (f.length>0) {
            Actions.file.keepalive(f);
        }
    }

};

module.exports = FileStore;
