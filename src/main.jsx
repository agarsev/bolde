"use strict";

var fs = require('fs');

var React = require('react');

var UserStore = require('./stores/UserStore');
var TabStore = require('./stores/TabStore');
var TabPanel = require('./components/TabPanel');
var ToolStore = require('./stores/ToolStore');
var ToolBar = require('./components/ToolBar');
var ProjectStore = require('./stores/ProjectStore');
var FileStore = require('./stores/FileStore');
var LogStore = require('./stores/LogStore');

var Actions = require('./Actions');

var Dispatcher = require('flux').Dispatcher;

window.Dispatcher = new Dispatcher();

window.UserStore = new UserStore();
window.TabStore = new TabStore();
window.ToolStore = new ToolStore();
window.ProjectStore = new ProjectStore();
window.FileStore = new FileStore();
window.LogStore = new LogStore();

this.node = React.render(<TabPanel />, document.getElementById('TabPanel'));
this.node = React.render(<ToolBar />, document.getElementById('NavBar'));

var welcome = fs.readFileSync('welcome.md', 'utf8');

Actions.tab.new_msg('Welcome', welcome);
