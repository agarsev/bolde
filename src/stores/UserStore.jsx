"use strict";

var EventEmitter = require('events').EventEmitter;

var t = require('tcomb-form');

class UserStore extends EventEmitter {

    constructor () {
        super();

        this.user = null;
        window.Dispatcher.register(a => {
            switch (a.actionType) {
            case 'user.login':
                this.user = a.user;
                this.token = a.token;
                this.messages = a.messages;
                this.settings = a.settings;
                this.emit('changed');
                break;
            case 'user.logout':
                this.user = null;
                this.token = null;
                this.loginError = null;
                this.emit('changed');
                break;
            case 'user.changeSettings':
                this.settings = a.settings;
                break;
            case 'user.loginFail':
                this.loginError = a.error;
                this.emit('changed');
                break;
            case 'server.messages':
            case 'user.messages':
                this.messages = a.messages;
                this.emit('changed');
                break;
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

    getMessages () {
        return this.messages;
    }

    getSettings () {
        return this.settings;
    }

    getLoginError () {
        return this.loginError;
    }

    getSettingsForm () {
        var model = t.struct({
            editor: t.enums({
                'default': 'default',
                'vim': 'vim',
                'emacs': 'emacs'
            })
        })
        var options = {
            fields: {
                editor: {
                    nullOption: false
                }
            }
        };
        var value = {
            editor: this.settings.editor
        };
        return { model, options, value };
    }

};

module.exports = UserStore;
