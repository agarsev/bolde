"use strict";

var util = require('util');

var Parser = require('borjes/src/parser');
var Read = require('borjes/src/reader');
var types = require('borjes/src/types');

var Worker = require('../engine_api');

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
    this.input()
    .then(this.test.bind(this))
    .catch(this.finish.bind(this));
}

Worker.prototype.init = function (config) {
    this.grammar = Read[config.format](config.files.grammar);
    this.log("DEBUG", "Loaded grammar");
    this.parser = Parser(this.grammar);
    this.log("DEBUG", "Built parser");
    this.test('')
};
