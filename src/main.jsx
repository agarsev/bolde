var $ = require('jquery');
var React = require('react');
var Stapes = require('stapes');

var UserStore = require('./UserStore');
var TabStore = require('./TabStore');
var TabPanel = require('./TabPanel');
var ToolStore = require('./ToolStore');
var ToolBar = require('./ToolBar');
var ProjectStore = require('./ProjectStore');

var Actions = require('./Actions');

var Dispatcher = require('flux').Dispatcher;

window.Dispatcher = new Dispatcher();

window.UserStore = new UserStore();
window.TabStore = new TabStore();
window.ToolStore = new ToolStore();
window.ProjectStore = new ProjectStore();

this.node = React.render(<TabPanel />, document.getElementById('TabPanel'));
this.node = React.render(<ToolBar />, document.getElementById('NavBar'));

var welcome = "# Collaborative Platform for the Development of Empirical Grammars\n" +
    "Work in progress online system\n\n" +
    "## Testing\n"+
    "- Login (upper right corner), user 'test' with the same password\n"+
    "- Open a file for editing\n\n"+
    "## Features\n"+
    "- Real-time collaborative editing\n";

Actions.open_message('Welcome', welcome);
