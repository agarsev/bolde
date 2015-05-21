"use strict";

var Actions = require('../Actions');

exports.None = {
    get: function () {
        throw "Reading from unexisting source";
    },
    put: function () {},
    close: function () {}
};

class Pipe {
    constructor () {
        this.queue = [];
        this.waiters = [];
    }
    put (x) {
        if (this.waiters.length>0) {
            var w = this.waiters.shift();
            w[0](x);
        } else {
            this.queue.push(x);
        }
    }
    get () {
        if (this.queue.length>0) {
            return Promise.resolve(this.queue.shift());
        } else if (this.closed) {
            return Promise.reject();
        } else {
            return new Promise(function (resolve, reject) {
                this.waiters.push([resolve, reject]);
            });
        }
    }
    close () {
        this.closed = true;
        if (this.waiters.length > 0) {
            for (var i=0; i<this.waiters.length; i++) {
                this.waiters[i][1]();
            }
        }
    }
}
exports.Pipe = Pipe;

class FileSource {
    constructor (filenames) {
        this.pipe = new Pipe();
        this.files = filenames;
        this.i = 0;
        this.loadnext();
    }
    get () {
        return this.pipe.get();
    }
    loadnext () {
        if (this.i<this.files.length) {
            Actions.file.load(this.files[this.i])
            .then(this.pumplines.bind(this));
        }
    }
    pumplines () {
        var lines = window.FileStore.getContents(this.files[this.i]).split('\n');
        for (var i = 0; i<lines.length; i++) {
            this.pipe.put(lines[i]);
        }
        this.i++;
        this.loadnext();
    }
}
exports.FileSource = FileSource;

class FileSink {
    constructor (filename) {
        this.fn = filename;
        this.lines = [];
    }
    put (line) {
        this.lines.push(line);
    }
    close () {
        Actions.file.put(this.fn, this.lines.join('\n'));
    }
}
exports.FileSink = FileSink;

class OutputDispatcher {
    constructor (name) {
        this.name = name;
        this.buffer = [];
    }
    put (result) {
        this.buffer = this.buffer.concat(result);
        Actions.output(this.name, this.buffer);
    }
    close () {
        delete this.buffer;
    }
}
exports.OutputDispatcher = OutputDispatcher;
