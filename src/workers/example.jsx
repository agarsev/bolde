"use strict";

var yaml = require('js-yaml');
var util = require('util');
var Parser = require('borjes/parser');
var Read = require('borjes/reader');

var parser;

function output (msg, detail) {
    postMessage({ msg, detail });
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

self.onmessage = function ( msg ) {
    switch (msg.data.channel) {
        case 'grammar':
            var grammar = Read.CFG(yaml.safeLoad(msg.data.grammar));
            output("[OK] loaded grammar");
            parser = new Parser(grammar);
            output("[OK] built parser");
            break;
        case 'input':
            sentences = msg.data.input.split('\n');
            for (var i=0; i<sentences.length; i++) {
                test(i);
            }
            break;
    }
};
