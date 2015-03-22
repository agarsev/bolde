var Stapes = require('stapes');
var React = require('react');
var DirTree = require('./DirTree');

var Project = Stapes.subclass({
    constructor: function(json, global) {
        this.name = json.name;
        this.files = json.files;
        this.user = json.user;
        this.global = global;
        this.key = 'Proj_'+this.name+'_files';
        /* from this on should be done by controller (main) */
        // tools
        global.tools.set(this.key, {title: this.name,
            menu: [ {title:'New file',click:function(){alert('new');}},
                    {title:'Run',click:function(){alert('run');}} ] });
        // views
        this.view = <DirTree path={this.user}
                     openFile={global.openFile.bind(global)}
                     name={this.name}
                     files={this.files} />;
        global.views.add(this.key, this.name, this.view);
        var This = this;
        global.views.on('remove:'+this.key, function() {
            global.views.remove(function(view) {
                return view.id.match("^file_"+This.user+"/"+This.name);
            });
            global.tools.remove(this.key);
        }, this);
    },
});

module.exports = Project;
