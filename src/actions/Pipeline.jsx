"use strict";

var File = require('./File');
var Engine = require('./Engine');

function runElement ( element, title, pipein, pipeout ) {
    return Promise.all(Object.keys(element.files).map(file => File.load(element.files[file])))
    .then(function () {
        Engine.start(element.engine);
        if (element.files !== undefined) {
            element.config.files = {};
            Object.keys(element.files).forEach(file => {
                element.config.files[file] = window.FileStore.getContents(element.files[file]);
            });
        }
        Engine.run(element.engine, title, element.config, pipein, pipeout);
    });
}

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

class FileSource {
    constructor (filename) {
        this.pipe = new Pipe();
        File.load(filename).then(() => {
            var lines = window.FileStore.getContents(filename).split('\n');
            for (var i = 0; i<lines.length; i++) {
                this.pipe.put(lines[i]);
            }
        });
    }
    get () {
        return this.pipe.get();
    }
}

exports.run = function (project, pipeline) {
    return new Promise(function (resolve, reject) {
        var pipe = { get: function () {
            throw "Reading from the beginning of the pipeline";
        }};
        for (var i=0; i<pipeline.length; i++) {
            var el = pipeline[i];
            if (el.config === undefined) { el.config = {}; }
            var nup;
            if (el.engine === 'file') {
                // TODO if many files, one after the other
                nup = new FileSource(el.files[0]);
            } else {
                nup = new Pipe();
                runElement(el, project, pipe, nup);
            }
            pipe = nup;
        }
    });
};
