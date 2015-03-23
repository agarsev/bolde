var Stapes = require('stapes');
var React = require('react');
var DirTree = require('./DirTree');
var $ = require('jquery');

var Project = Stapes.subclass({
    constructor: function(json, global) {
        this.name = json.name;
        this.set('files', json.files);
        this.user = json.user;
        this.global = global;
        this.key = 'Proj_'+this.name+'_files';
        /* from this on should be done by controller (main) */
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
        var This = this;
        global.views.on('remove:'+this.key, function() {
            global.views.remove(function(view) {
                return view.id.match("^file_"+This.user+"/"+This.name);
            });
            global.tools.remove(this.key);
        }, this);
    },
    newFile: function() {
        name = prompt('New file name:');
        if (!name) { return false; }
        var This = this;
        $.ajax({
            method: 'POST',
            url: 'api/file/new/'+This.user+'/'+This.name+'/'+name,
            contentType: 'application/json',
            data: JSON.stringify({token: This.global.get('token')}),
            success: function(data) {
                if (data.ok) {
                    This.set('files', data.files);
                } else {
                    console.log(data.error);
                }
            }
        });
    }
});

module.exports = Project;
