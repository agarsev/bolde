var $ = require('jquery');
var React = require('react');
var Stapes = require('stapes');

var ViewList = require('./ViewList');
var ToolList = require('./ToolList');
var Project = require('./Project');

var NavBar = require('./NavBar');
var TabPanel = require('./TabPanel');
var MDText = require('./MDText');

var global = new (Stapes.subclass({
    login: function(user, password) {
        var This = this;
        $.ajax({
            method: 'POST',
            url: "api/login/",
            data: JSON.stringify({user:user, password:password}),
            contentType: 'application/json',
            success: function(data) {
                if (data.ok) {
                    This.set('token', data.token);
                    This.set('user', user);
                    This.userprojects = data.projects;
                    var list = "Welcome back, "+user+"\n## Your Projects\n";
                    Object.keys(data.projects).forEach(function(p) {
                        data.projects[p].user = user;
                        data.projects[p].name = p;
                        list += "- ["+p+"](#"+p+")\n";
                    });
                    This.views.add('projects', 'Projects', <MDText links={This.openProject.bind(This)} text={list} />);
                } else {
                    console.log(data.error);
                }
            }
        });
    },
    openProject: function(name) {
        return new Project(this.userprojects[name], this);
    },
    openFile: function(filename) {
        var key = 'file_'+filename;
        if (this.views.has(key)) {
            this.tabpanel.focus(key);
        } else {
            var This = this;
            require(["./Editor"], function(Editor) {
                This.views.set(key,
                         { id: key
                         , title: filename.substr(filename.search(/\/[^\/]+$/)+1)
                         , node: <Editor filename={filename} />
                         });
            });
        }
    },
}));

global.views = new ViewList();
global.tools = new ToolList();

var welcome = "# Collaborative Platform for the Development of Empirical Grammars\n" +
    "Work in progress online system\n\n" +
    "## Testing\n"+
    "- Login (upper right corner), user 'test' with the same password\n"+
    "- Open a file for editing\n\n"+
    "## Features\n"+
    "- Real-time collaborative editing\n";

global.views.add("Welcome", "Welcome", <MDText text={welcome} />);

global.navbar = React.render(<NavBar global={global} />, document.getElementById('NavBar'));
global.tabpanel = React.render(<TabPanel global={global} />, document.getElementById('TabPanel'));
