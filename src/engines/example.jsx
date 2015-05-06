"use strict";

var yaml = require('js-yaml');
var util = require('util');
var Parser = require('borjes/parser');
var Read = require('borjes/reader');

// TODO multiple parsers, names
var parser;
var name;

function output (msg, detail) {
    postMessage({ event: 'output', name, data: { msg, detail }});
}

var sentences;
function test(i) {
    if (sentences[i] === '') { return; }
    var sentence = sentences[i].split(' ');
    var parse = parser.parse(sentence);
    if (!parse[0]) {
        output("[ERROR] Wrong parse for '"+sentences[i]+"'", util.inspect(parser.table, { depth: null }));
    } else {
        output("[OK] "+sentences[i], parse[0]);
    }
}

self.onmessage = function ( e ) {
    var msg = e.data;
    switch (msg.event) {
        case 'config':
            name = msg.name;
            var grammar = Read.CFG(yaml.safeLoad(msg.data.files.grammar));
            output("[OK] loaded grammar");
            parser = new Parser(grammar);
            output("[OK] built parser");
            break;
        case 'input':
            sentences = msg.data.split('\n');
            for (var i=0; i<sentences.length; i++) {
                test(i);
            }
            postMessage({ event: 'finish', name });
            break;
    }
};
