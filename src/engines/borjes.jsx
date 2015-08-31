"use strict";

var util = require('util');

var bjs = require('borjes');
var Parser = bjs.parser;
var types = bjs.types;

var Worker = require('../utils/EngineWorker');

Worker.prototype.test = function (sentence) {
    if (sentence !== '') {
        var words = sentence.split(' ');
        var parse = Parser.parse(this.parser, words);
        if (parse === types.Nothing) {
            this.log("ERROR", "Wrong parse for '"+sentence+"'");
        } else {
            this.log("INFO", "Correct parse for '"+sentence+"'");
            this.output(parse);
        }
    }
}

Worker.prototype.init = function (config) {
    switch (config.format) {
    case 'CFG':
    case 'cfg':
        this.grammar = bjs.grammar[config.format](config.files.grammar);
        break;
    case 'HPSG':
    case 'hpsg':
        var desc = config.files.grammar;
        types.Lattice.fromProto(desc.global.signature, 'signature');
        var l = bjs.lexicon();
        for (var w in desc.lexicon) {
            bjs.lexicon.add(l, w, desc.lexicon[w]);
        }
        this.grammar = bjs.grammar(desc.rules, l);
        break;
    }
    this.log("DEBUG", "Loaded grammar");
    this.parser = Parser(this.grammar);
    this.log("DEBUG", "Built parser");
};

Worker.prototype.onInput = function (data) {
    this.test(data);
};
