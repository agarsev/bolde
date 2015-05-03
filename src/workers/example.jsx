"use strict";

var yaml = require('js-yaml');
var util = require('util');
var Parser = require('borjes/parser');
var Read = require('borjes/reader');

var parser;

var buffer = '';
function output (str) {
    buffer += str + "\n\n";
    postMessage(buffer);
}

var sentences;
function test(i) {
    if (sentences[i] === '') { return; }
    var sentence = sentences[i].split(' ');
    var parse = parser.parse(sentence);
    if (!parse[0]) {
        output("Wrong parse for '"+sentences[i]+"'");
        output(util.inspect(parser.table, { depth: null }));
    } else {
        output("OK '"+sentences[i]+"'");
        output(parse[0].node+'');
    }
}

self.onmessage = function ( msg ) {
    switch (msg.data.channel) {
        case 'grammar':
            var grammar = Read.CFG(yaml.safeLoad(msg.data.grammar));
            output("loaded grammar");
            parser = new Parser(grammar);
            output("built parser");
            break;
        case 'input':
            sentences = msg.data.input.split('\n');
            for (var i=0; i<sentences.length; i++) {
                test(i);
            }
            break;
    }
};
