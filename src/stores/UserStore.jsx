"use strict";

var EventEmitter = require('events').EventEmitter;

class UserStore extends EventEmitter {

    constructor () {
        this.user = null;
        window.Dispatcher.register(a => {
            if (a.actionType == 'login') {
                this.user = a.user;
                this.token = a.token;
                this.emit('changed');
            } else if (a.actionType == 'logout') {
                this.user = null;
                this.token = null;
                this.emit('changed');
            }
        });
    }

    isLogged () {
        return this.user != null;
    }

    getUser () {
        return this.user;
    }

    getToken () {
        return this.token;
    }
};

module.exports = UserStore;
