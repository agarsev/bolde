"use strict";

var util = require('util');

var bjs = require('borjes');
var Parser = bjs.Parser;
var Lexicon = bjs.Lexicon;
var types = bjs.types;
var World = types.World;
var Literal = types.Literal;

var Worker = require('../utils/EngineWorker');

Worker.prototype.test = function (sentence) {
    if (sentence !== '') {
        var words = sentence.split(' ');
        var parse = Parser.parse(this.parser, words);
        if (types.eq(parse, types.Nothing)) {
            this.log("ERROR", "No parse for '"+sentence+"'");
        } else {
            this.log("INFO", "Parsed '"+sentence+"'");
            this.output(parse);
        }
    }
}

Worker.prototype.init = function (config) {
    switch (config.format) {
    case 'CFG':
    case 'cfg':
    case 'yaml':
    case 'YAML':
    case 'yml':
    case 'YML':
        this.grammar = bjs.Grammar.from_YAML(config.files.grammar);
        break;
    case 'HPSG':
    case 'hpsg':
    case 'json':
    case 'JSON':
        this.grammar = bjs.Grammar();
        for (var k in config.files) {
            this.log("DEBUG", "Compiling "+k);
            bjs.Grammar.from_JSON(this.grammar, config.files[k]);
        }
        break;
    }
    this.log("DEBUG", "Creating parser");
    this.parser = Parser(this.grammar);
    this.log("DEBUG", "Built parser");
};

Worker.prototype.onInput = function (data) {
    this.test(data);
};
