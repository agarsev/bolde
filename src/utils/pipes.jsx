"use strict";

var Actions = require('../Actions');

class FileSource {
    constructor (filenames, output) {
        this.output = output;
        this.files = filenames;
        this.i = 0;
        this.loadnext();
    }
    loadnext () {
        if (this.i<this.files.length) {
            Actions.file.load(this.files[this.i])
            .then(this.pumplines.bind(this));
        } else {
            this.output.close();
        }
    }
    pumplines () {
        var lines = window.FileStore.getContents(this.files[this.i]).split('\n');
        for (var i = 0; i<lines.length; i++) {
            this.output.put(lines[i]);
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

class TreeBankSink {
    constructor (name) {
        this.name = name;
    }
    put (tree) {
        Actions.treebank.store(this.name, tree);
    }
    close () {}
}
exports.TreeBankSink = TreeBankSink;
