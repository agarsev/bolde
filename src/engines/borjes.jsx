"use strict";

var util = require('util');

var bjs = require('borjes');
var Parser = bjs.Parser;
var types = bjs.types;

var Worker = require('../utils/EngineWorker');

Worker.prototype.test = function (sentence) {
    if (sentence !== '') {
        var words = sentence.split(' ');
        var parse = Parser.parse(this.parser, words);
        if (types.eq(parse, types.Nothing)) {
            this.log("ERROR", "No parse for '"+sentence+"'");
        } else {
            this.log("INFO", "Parsed '"+sentence+"'");
            console.log(parse);
            this.output(parse);
        }
    }
}

Worker.prototype.init = function (config) {
    switch (config.format) {
    case 'CFG':
    case 'cfg':
        this.grammar = bjs.Grammar[config.format](config.files.grammar);
        break;
    case 'HPSG':
    case 'hpsg':
        var desc = config.files.grammar;
        types.Lattice.fromProto(desc.global.signature, 'signature');
        var l = bjs.Lexicon();
        for (var w in desc.lexicon) {
            bjs.Lexicon.add(l, w, desc.lexicon[w]);
        }
        this.grammar = bjs.Grammar(desc.rules, l);
        break;
    }
    this.log("DEBUG", "Loaded grammar");
    this.parser = Parser(this.grammar);
    this.log("DEBUG", "Built parser");
};

Worker.prototype.onInput = function (data) {
    this.test(data);
};
