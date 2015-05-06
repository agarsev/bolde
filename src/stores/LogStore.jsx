"use strict";

var React = require('react');
var EventEmitter = require('events').EventEmitter;
var MsgDetail = require('../components/MsgDetail');

class LogStore extends EventEmitter {

    constructor () {
        super();

        this.logs = {};
        this.dispatchToken = window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'log.new':
                    if (!this.logs[a.name]) { this.logs[a.name] = []; }
                    this.logs[a.name].push(<MsgDetail name={a.name+' '+this.logs[a.name].length} msg={a.msg} detail={a.detail} />);
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
