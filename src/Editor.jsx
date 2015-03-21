var $ = require('jquery');
var React = require('react');

require('../bower_components/ace-builds/src-min-noconflict/ace.js');
ace.config.set("basePath", "bower_components/ace-builds/src-min-noconflict");

var Editor = React.createClass({
    render: function () {
        return (
            <div id={"Editor_"+this.props.filename}>Loading {this.props.filename}...</div>
        );
    },
    init: function (editor) {
        editor.getSession().setUseWrapMode(true);
        editor.setKeyboardHandler("ace/keyboard/vim");
        editor.focus();
    },
    componentDidMount: function () {
        var editor = ace.edit("Editor_"+this.props.filename);
        this.init(editor);
        this.share(editor);
    },
    share: function (editor) {
        $.ajax({
            url: "api/sharejs/open/"+this.props.filename,
            success: function(data) {
                window.BCSocket = require("../node_modules/share/node_modules/browserchannel/dist/bcsocket.js").BCSocket;
                require("../node_modules/share/webclient/share.js");
                require("../node_modules/share/webclient/ace.js");

                sharejs.open(data.name, 'text',
                    location.href.substr(0, location.href.search(/\/[^\/]*$/))+'/api/sharejs/channel',
                    function(error, doc) {
                        doc.attach_ace(editor);
                        editor.getSession().setMode("ace/mode/"+data.mode);
                    }
                );
            }
        });
    }
});

module.exports = Editor;
