"use strict";

var nedb = require('nedb');

var EventEmitter = require('events').EventEmitter;

class TreebankStore extends EventEmitter {

    constructor () {
        super();

        this.tb = {};

        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'treebank.new':
                    //this.tb[a.name] = new nedb({filename: a.name, autoload: true });
                    this.tb[a.name] = new nedb();
                    break;
                case 'treebank.store':
                    this.tb[a.name].insert(a.trees);
                    break;
            }
        });
    }

    getTreebanks () {
        return Object.keys(this.tb);
    }

    exists (name) {
        return this.tb[name]!==undefined;
    }

    query (treebank, query) {
        var store = this;
        return new Promise(function (resolve, reject) {
            store.tb[treebank].find(query, function (err, docs) {
                if (err) {
                    reject(err);
                } else {
                    resolve(docs);
                }
            });
        });
    }

}

module.exports = TreebankStore;
