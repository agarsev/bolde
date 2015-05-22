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
    var end = false;
    for (var i=0; !end && i<pipeline.length; i++) {
        var source = pipeline[i];
        var sink = pipeline[i+1];
        if (source.config === undefined) { source.config = {}; }
        var nup;
        if (sink === undefined) {
            nup = pipes.None;
        } else if (sink.type === 'file') {
            nup = new pipes.FileSink(sink.files[0]);
            end = true;
        } else if (sink.type === 'display') {
            nup = new pipes.OutputDispatcher(project);
            end = true;
        } else if (sink.type === 'treebank') {
            nup = new pipes.TreeBankSink(sink.files[0]);
            end = true;
        } else {
            nup = new pipes.Pipe();
        }
        if (source.type === 'file') {
            nup = new pipes.FileSource(source.files);
        } else {
            runElement(source, project, pipe, nup);
        }
        pipe = nup;
    }
};
