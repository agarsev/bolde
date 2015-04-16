var Stapes = require('stapes');
var React = require('react');
var DirTree = require('./DirTree');
var $ = require('jquery');

var Project = Stapes.subclass({
    constructor: function(json) {
        this.name = json.name;
        this.set('files', json.files);
        this.user = json.user;
        this.key = 'Proj_'+this.name+'_files';
        var global = window.global;
        // tools
        global.tools.set(this.key, {title: this.name,
            menu: [ {title:'New file',click:this.newFile.bind(this)},
                    {title:'Run',click:function(){alert('run');}} ] });
        // views
        this.view = <DirTree project={this}
                     path={this.user}
                     openFile={global.openFile.bind(global)}
                     name={this.name} />;
        global.views.add(this.key, this.name, this.view);

        global.views.on('remove:'+this.key, this.viewClosed, this);
    },
    close: function(view_closed) {
        var This = this;
        var global = window.global;
        global.views.remove(function(view) {
            return view.id.match("^file_"+This.user+"/"+This.name);
        });
        global.tools.remove(this.key);
        if (!view_closed) {
            global.views.off('remove:'+this.key, this.close);
            global.views.remove(this.key);
        }
        this.emit('close');
    },
    viewClosed: function () {
        this.close(true);
    },
    newFile: function() {
        name = prompt('New file name:');
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
    },
    deleteFile: function(fullname) {
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
    },
    focus: function() {
        window.global.views.focus(this.key);
    }
});

module.exports = Project;
