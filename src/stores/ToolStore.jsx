var Stapes = require('stapes');

var ToolStore = Stapes.subclass({
    constructor: function () {
        this.tools = {};
        window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'login':
                    this.addTool('_settings', 'Settings', () => false, true);
                    break;
                case 'logout':
                    this.removeTool('_settings');
                    break;
                case 'add_tool':
                    this.addTool(a.id, a.title, a.click, a.right);
                    break;
                case 'add_menu':
                    this.addMenu(a.id, a.title, a.menu, a.right);
                    break;
                case 'remove_tool':
                    this.removeTool(a.id);
                    break;
                case 'open_project':
                    this.addMenu('Proj_'+a.name, a.name, [
                        {title:'New file',click:() => alert('new file')},
                        {title:'Run',click:() => alert('run')}
                    ]);
                    break;
                case 'close_project':
                    this.removeTool('Proj_'+a.name);
                    break;
            }
        });
    },
    getTools: function (right) {
        return Object.keys(this.tools)
            .filter(id => this.tools[id].right == right)
            .map(id => this.tools[id]);
    },
    addTool: function (id, title, click, right) {
        if (right === undefined) { right = false; }
        this.tools[id] = { title: title,
                click: click,
                right: right };
        this.emit('changed');
    },
    addMenu: function (id, title, menu, right) {
        if (right === undefined) { right = false; }
        this.tools[id] = { title: title,
                menu: menu,
                right: right };
        this.emit('changed');
    },
    removeTool: function (id) {
        delete this.tools[id];
        this.emit('changed');
    }
});

module.exports = ToolStore;
