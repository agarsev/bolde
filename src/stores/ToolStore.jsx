var Stapes = require('stapes');

var ToolStore = Stapes.subclass({
    constructor: function () {
        this.tools = {};
        window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'login':
                    this.tools['_settings'] = {
                        title: 'Settings',
                        right: true,
                        click: () => false
                    };
                    this.emit('changed');
                    break;
                case 'logout':
                    delete this.tools['_settings'];
                    this.emit('changed');
                    break;
            }
        });
    },
    getTools: function (right) {
        return Object.keys(this.tools)
            .filter(id => this.tools[id].right == right)
            .map(id => this.tools[id]);
    }
});

module.exports = ToolStore;
