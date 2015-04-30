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
                        mode: a.mode
                    };
                    break;
                case 'file.close':
                    var path = a.user+'/'+a.project+'/'+a.path;
                    if (this.files[path]) {
                        this.files[path].doc.close();
                        delete this.files[path];
                    }
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
