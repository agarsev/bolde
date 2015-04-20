//var Events = require('events');

class FileStore {

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

};

module.exports = FileStore;
