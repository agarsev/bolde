"use strict";

var util = require('util');

var Parser = require('borjes/src/parser');
var Read = require('borjes/src/reader');
var types = require('borjes/src/types');

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
    var parse = Parser.parse(parser, sentence);
    if (parse === types.Nothing ) {
        output("[ERROR] Wrong parse for '"+sentences[i]+"'");
        //output("[ERROR] Wrong parse for '"+sentences[i]+"'", util.inspect(parser.table, { depth: null }));
    } else {
        output("[OK] "+sentences[i], parse);
    }
}

self.onmessage = function ( e ) {
    var msg = e.data;
    switch (msg.event) {
        case 'config':
            name = msg.name;
            var grammar = Read[msg.data.format](msg.data.files.grammar);
            output("[OK] loaded grammar");
            parser = Parser(grammar);
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
