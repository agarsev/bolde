var Stapes = require('stapes');
var React = require('react');
var $ = require('jquery');

var ProjectStore = Stapes.subclass({
    constructor: function () {
        this.projects = {};
        window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'login':
                    this.projects = a.projects;
                    Object.keys(this.projects).forEach(p => {
                        this.projects[p].user = a.user;
                        this.projects[p].name = p;
                    });
                    break;
                case 'logout':
                    window.Dispatcher.waitFor([
                        window.TabStore.dispatchToken,
                        window.ToolStore.dispatchToken
                    ]);
                    this.projects = {};
                    break;
            }
        });
    },
    get: function (name) {
        return this.projects[name];
    },
    getAll: function () {
        return Object.keys(this.projects);
    },
    newFile: function() {
        name = prompt('New file name:');
        /*
        if (!name) { return false; }
        var This = this;
        $.ajax({
            method: 'POST',
            url: 'api/file/new/'+This.user+'/'+This.name+'/'+name,
            contentType: 'application/json',
            data: JSON.stringify({token: window.global.get('token')}),
            success: function(data) {
                if (data.ok) {
                    This.set('files', data.files);
                } else {
                    console.log(data.error);
                }
            }
        });
        */
    },
    deleteFile: function(fullname) {
        /*
        if (!fullname) { return false; }
        var This = this;
        $.ajax({
            method: 'POST',
            url: 'api/file/delete/'+fullname,
            contentType: 'application/json',
            data: JSON.stringify({token: window.global.get('token')}),
            success: function(data) {
                if (data.ok) {
                    window.global.closeFile(fullname);
                    This.set('files', data.files);
                } else {
                    console.log(data.error);
                }
            }
        });
        */
    },
});

module.exports = ProjectStore;
