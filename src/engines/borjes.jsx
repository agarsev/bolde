"use strict";

var util = require('util');

var Parser = require('borjes/src/parser');
var Read = require('borjes/src/reader');
var types = require('borjes/src/types');

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
    this.grammar = Read[config.format](config.files.grammar);
    this.log("DEBUG", "Loaded grammar");
    this.parser = Parser(this.grammar);
    this.log("DEBUG", "Built parser");
};

Worker.prototype.onInput = function (data) {
    this.test(data);
};
