"use strict";

var EventEmitter = require('events').EventEmitter;

var t = require('tcomb-form');

class UserStore extends EventEmitter {

    constructor () {
        super();

        this.user = null;
        window.Dispatcher.register(a => {
            switch (a.actionType) {
            case 'login':
                this.user = a.user;
                this.token = a.token;
                this.settings = a.settings;
                this.emit('changed');
                break;
            case 'logout':
                this.user = null;
                this.token = null;
                this.emit('changed');
                break;
            case 'changeSettings':
                this.settings = a.settings;
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

    getSettings () {
        return this.settings;
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
