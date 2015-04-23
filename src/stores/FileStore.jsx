"use strict";

var EventEmitter = require('events').EventEmitter;

class FileStore extends EventEmitter {

    constructor () {
        this.files = {};

        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'load_file':
                    this.files[a.filename] = {
                        doc: a.doc,
                        mode: a.mode
                    };
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
