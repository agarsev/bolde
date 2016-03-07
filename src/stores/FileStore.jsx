"use strict";

var EventEmitter = require('events').EventEmitter;
var Actions = require('../Actions');

function fullpath (action) {
    return action.user+'/'+action.project+'/'+action.path;
}

class FileStore extends EventEmitter {

    constructor () {
        super();

        this.files = {};
        this.keepalive = setInterval(this.keepalive.bind(this), 5000);

        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'file.load':
                    this.files[fullpath(a)] = {
                        doc: a.doc,
                        mode: a.mode,
                        type: a.type,
                    };
                    break;
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
                case 'logout':
                    for (path in this.files) {
                        this.files[path].doc.close();
                    }
                    this.files = {};
                    break;
            }
        });
    }

    isLoaded (path) {
        return path in this.files;
    }

    getFile (path) {
        return this.files[path];
    }

    getContents (path) {
        var f = this.files[path];
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
