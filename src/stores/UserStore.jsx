var Stapes = require('stapes');

var UserStore = Stapes.subclass({
    constructor: function() {
        window.Dispatcher.register(function (a) {
            if (a.actionType == 'login') {
                this.user = a.user;
                this.token = a.token;
            } else if (a.actionType == 'logout') {
                this.user = null;
                this.token = null;
            }
        });
    },
});

module.exports = UserStore;
