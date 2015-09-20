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
        this.grammar = bjs.Grammar[config.format](config.files.grammar);
        break;
    case 'HPSG':
    case 'hpsg':
        var desc = config.files.grammar;
        this.log("DEBUG", "Loading signature");
        types.Lattice.fromProto(desc.global.signature, 'signature');
        this.log("DEBUG", "Loading lexicon");
        var l = Lexicon();
        desc.lexicon.forEach((paradigm) => {
            var common = paradigm.common;
            for (var j=0; j<paradigm.values.length; j++) {
                var value = paradigm.values[j][3];
                var regex = new RegExp(paradigm.values[j][0]);
                var subst = paradigm.values[j][1];
                var guard = paradigm.values[j][2];
                Lexicon.inflect(l, (lexeme) => {
                    var u = bjs.unify(guard, lexeme[1]);
                    if (types.eq(u, types.Nothing)) { return []; }
                    var w = types.copy(common);
                    var m = lexeme[0].replace(regex, subst);
                    World.set(w, 0, Literal(lexeme[0]));
                    World.set(w, 1, Literal(m));
                    for (var i=2; i<lexeme.length; i++) {
                        World.set(w, i, lexeme[i]);
                    }
                    var v = types.copy(value);
                    World.bind(w, v);
                    return [[m, types.normalize(v)]];
                }, paradigm.lexemes);
            }
        });
        this.log("DEBUG", "Creating grammar");
        this.grammar = bjs.Grammar(desc.rules, l, desc.principles);
        break;
    }
    this.log("DEBUG", "Creating parser");
    this.parser = Parser(this.grammar);
    this.log("DEBUG", "Built parser");
};

Worker.prototype.onInput = function (data) {
    this.test(data);
};
