"use strict";

var EventEmitter = require('events').EventEmitter;

class TreebankStore extends EventEmitter {

    constructor () {
        super();

        this.tbs = {};
        this.queries = [];

        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'treebank.new':
                    if (this.w === undefined) { this.start(); }
                    this.w.postMessage({ event: 'new', name: a.name });
                    this.tbs[a.name] = true;
                    break;
                case 'treebank.store':
                    if (this.w === undefined) { this.start(); }
                    this.w.postMessage({ event: 'store', name: a.name, trees: a.trees });
                    break;
            }
        });
    }

    getTreebanks () {
        return Object.keys(this.tbs);
    }

    exists (name) {
        return this.tbs[name]!==undefined;
    }

    start () {
        this.w = new Worker('engines/treebank.js');
        this.w.onmessage = (e) => {
            var m = e.data;
            switch (m.event) {
            case 'query':
                if (m.error) {
                    this.queries[m.i][1](m.error);
                } else {
                    this.queries[m.i][0](m.result);
                }
                delete this.queries[m.i];
                break;
            }
        };
    }

    query (name, query) {
        return new Promise((resolve, reject) => {
            this.queries.push([resolve, reject]);
            this.w.postMessage({ event: 'query', name, query, i: this.queries.length-1 });
        });
    }

}

module.exports = TreebankStore;
