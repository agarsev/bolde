"use strict";

var EventEmitter = require('events').EventEmitter;
var Components = require('../Components');

class LogStore extends EventEmitter {

    constructor () {
        super();

        this.logs = {};
        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'log.new':
                    if (!this.logs[a.name]) { this.logs[a.name] = []; }
                    this.logs[a.name].push({ level: a.level, message: a.message });
                    this.emit('changed');
                    break;
            }
        });
    }

    getAll (filter) {
        return this.logs[filter];
    }

}

module.exports = LogStore;
