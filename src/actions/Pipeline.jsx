"use strict";

var File = require('./File');
var Engine = require('./Engine');
var pipes = require('../utils/pipes');

function runElement ( element, title, pipein, pipeout ) {
    return Promise.all(Object.keys(element.files).map(file => File.load(element.files[file])))
    .then(function () {
        Engine.start(element.type);
        if (element.files !== undefined) {
            element.config.files = {};
            Object.keys(element.files).forEach(file => {
                element.config.files[file] = window.FileStore.getContents(element.files[file]);
            });
        }
        Engine.run(element.type, title, element.config, pipein, pipeout);
    });
}

exports.run = function (project, pipeline) {
    var pipe = pipes.None;
    for (var i=pipeline.length-1; i>0; i--) {
        var source = pipeline[i-1];
        var sink = pipeline[i];
        var nup;
        switch (source.type) {
        case 'file':
            nup = new pipes.FileSource(source.files);
            break;
        default:
            nup = new pipes.Pipe();
            break;
        }
        switch (sink.type) {
        case 'file':
            nup = new pipes.FileSink(sink.files[0]);
            break;
        case 'display':
            nup = new pipes.OutputDispatcher(project);
            break;
        case 'treebank':
            nup = new pipes.TreeBankSink(sink.files[0]);
            break;
        default:
            if (sink.config === undefined) { sink.config = {}; }
            runElement(sink, project, nup, pipe);
            break;
        }
        pipe = nup;
    }
    var origin = pipeline[0];
    switch (source.type) {
        case 'file':
            break;
        default:
            runElement(origin, project, pipes.None, pipe);
            break;
    }
};
