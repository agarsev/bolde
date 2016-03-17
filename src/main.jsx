"use strict";

require('styles/layout');
require('styles/dark');

var fs = require('fs');

var React = require('react');

var UserStore = require('stores/UserStore');
var UserPage = require('components/UserPage');
var TabStore = require('stores/TabStore');
var TabPanel = require('components/TabPanel');
var ProjectStore = require('stores/ProjectStore');
var FileStore = require('stores/FileStore');
var LogStore = require('stores/LogStore');
var TreebankStore = require('stores/TreebankStore');
var Prompt = require('components/Prompt');

var Actions = require('Actions');

var Dispatcher = require('flux').Dispatcher;

window.Dispatcher = new Dispatcher();

window.UserStore = new UserStore();
window.TabStore = new TabStore();
window.ProjectStore = new ProjectStore();
window.FileStore = new FileStore();
window.LogStore = new LogStore();
window.TreebankStore = new TreebankStore();

React.render(<TabPanel />, document.getElementById('TabPanel'));

window.Dispatcher.register(a => { switch(a.actionType) {
    case 'prompt.in':
        React.render(<Prompt form={a.form} msg={a.msg} resolve={a.resolve} reject={a.reject} />,
                     document.getElementById('Prompt'));
        break;
    case 'prompt.out':
        React.unmountComponentAtNode(document.getElementById('Prompt'));
        break;
}});

var welcome = fs.readFileSync('config/welcome.md', 'utf8');

Actions.tab.new_msg('Welcome', welcome);
Actions.tab.open('_UserTab', 'Anonymous User', <UserPage />, 2, () => {
    if (window.UserStore.getUser()) {
        Actions.prompt(undefined, 'Do you want to log out?')
             .then(() => Actions.user.logout());
    }
    return false;
});

window.onerror = function (msg, script, line, col, err) {
    console.log(msg, script, line, col, err);
    Actions.prompt(undefined, <div><p>The system has experienced an internal error:</p><p>{msg}</p><p>Do you want to reload BOLDE?</p></div>)
    .then(() => { window.location.reload(); })
    .catch(() => {});
};
