var Stapes = require('stapes');

var UserStore = Stapes.subclass({
    constructor: function() {
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
    },
    isLogged: function() {
        return this.user != null;
    },
    getUser: function() {
        return this.user;
    },
    getToken: function() {
        return this.token;
    }
});

module.exports = UserStore;
