"use strict";

var File = require('./File');
var Engine = require('./Engine');
var pipes = require('../utils/pipes');
var api = require('./api');

function runEngineElement ( element, title, after ) {
    Engine.start(element.type);
    return Promise.all(Object.keys(element.files).map(file => File.load(element.files[file])))
    .then(function () {
        if (element.files !== undefined) {
            element.config.files = {};
            Object.keys(element.files).forEach(file => {
                element.config.files[file] = window.FileStore.getContents(element.files[file]);
            });
        }
        return Engine.run(element.type, title, element.config, after);
    });
}

function runElement ( element, title, after ) {
    if (element.config === undefined) { element.config = {}; }
    if (after !== null && after.add_in !== undefined) {
        after.add_in();
    }
    switch (element.type) {
        case 'javascript':
        case 'borjes':
            return runEngineElement(element, title, after);
        case 'filesource':
            return Promise.resolve(new pipes.FileSource(element.files, after));
        case 'filesink':
            return Promise.resolve(new pipes.FileSink(element.files[0]));
        case 'display':
            return Promise.resolve(new pipes.OutputDispatcher(title));
        case 'treebank':
            return Promise.resolve(new pipes.TreeBankSink(element.files[0]));
        case 'tee':
            if (element.tee_element === undefined) {
                element.tee_element = new pipes.Tee();
            }
            element.tee_element.add_out(after);
            return Promise.resolve(element.tee_element);
    }
    api.log("Unrecognized element name: "+element.type);
    return Promise.reject("Unrecognized element name: "+element.type);
}

function runIndex (pipeline, index, title, after) {
    if (index>=0) {
        runElement(pipeline[index], title, after)
        .then(function (result) {
            return runIndex(pipeline, index-1, title, result);
        });
    }
}

exports.run = function (project, pipeline) {
    runIndex(pipeline, pipeline.length-1, project, null);
};
