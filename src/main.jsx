var $ = require('jquery');
var React = require('react');
var Stapes = require('stapes');

var ViewList = require('./ViewList');
var ToolList = require('./ToolList');
var Project = require('./Project');

var MDText = require('./MDText');
var User = require('./User');

window.global = new (Stapes.subclass({
    constructor: function () {
        this.views = new ViewList(document.getElementById('TabPanel'));
        this.tools = new ToolList(document.getElementById('NavBar'));
    },
    open: function (system, data) {
        switch (system) {
            case 'User':
                return new User();
                break;
            case 'Project':
                return new Project(data);
                break;
        }
    },
    openFile: function(filename) {
        var key = 'file_'+filename;
        if (this.views.has(key)) {
            this.views.focus(key);
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
    closeFile: function(filename) {
        var key = 'file_'+filename;
        if (this.views.has(key)) {
            this.views.remove(key);
        }
    }
}))();

var welcome = "# Collaborative Platform for the Development of Empirical Grammars\n" +
    "Work in progress online system\n\n" +
    "## Testing\n"+
    "- Login (upper right corner), user 'test' with the same password\n"+
    "- Open a file for editing\n\n"+
    "## Features\n"+
    "- Real-time collaborative editing\n";

window.global.views.add("Welcome", "Welcome", <MDText text={welcome} />);

new User();
