"use strict";

var EventEmitter = require('events').EventEmitter;

class FileStore extends EventEmitter {

    constructor () {
        super();

        this.files = {};

        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'file.load':
                    this.files[a.filename] = {
                        doc: a.doc,
                        mode: a.mode,
                        type: a.type
                    };
                    break;
                case 'file.close':
                    var path = a.user+'/'+a.project+'/'+a.path;
                    if (this.files[path]) {
                        this.files[path].doc.close();
                        delete this.files[path];
                    }
                    break;
                case 'file.put':
                    var f = this.files[a.path];
                    if (f.type !== 'text') {
                        throw 'Trying to write to non-text file';
                    }
                    var doc = f.doc;
                    doc.del(0, doc.getText().length);
                    doc.insert(0, a.content);
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
        return this.files[path].doc.getText();
    }

};

module.exports = FileStore;
