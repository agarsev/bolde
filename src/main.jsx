"use strict";

var React = require('react');

var UserStore = require('./stores/UserStore');
var TabStore = require('./stores/TabStore');
var TabPanel = require('./components/TabPanel');
var ToolStore = require('./stores/ToolStore');
var ToolBar = require('./components/ToolBar');
var ProjectStore = require('./stores/ProjectStore');
var FileStore = require('./stores/FileStore');

var Actions = require('./Actions');

var Dispatcher = require('flux').Dispatcher;

window.Dispatcher = new Dispatcher();

window.UserStore = new UserStore();
window.TabStore = new TabStore();
window.ToolStore = new ToolStore();
window.ProjectStore = new ProjectStore();
window.FileStore = new FileStore();

this.node = React.render(<TabPanel />, document.getElementById('TabPanel'));
this.node = React.render(<ToolBar />, document.getElementById('NavBar'));

var welcome = "# Collaborative Platform for the Development of Empirical Grammars\n" +
    "Work in progress online system\n\n" +
    "## Testing\n"+
    "- Login (upper right corner), user 'test' with the same password\n"+
    "- Open a file for editing\n\n"+
    "## Features\n"+
    "- Real-time collaborative editing\n";

Actions.tab.new_msg('Welcome', welcome);
