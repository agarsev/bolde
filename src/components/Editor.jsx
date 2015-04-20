var React = require('react');

require('../bower_components/ace-builds/src-min-noconflict/ace.js');
ace.config.set("basePath", "bower_components/ace-builds/src-min-noconflict");

var Editor = React.createClass({
    render: function () {
        return (
            <div id={"Editor_"+this.props.filename}></div>
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
        var file = window.FileStore.getFile(this.props.filename);
        file.doc.attach_ace(editor);
        editor.getSession().setMode("ace/mode/"+file.mode);
        editor.getSession().setUndoManager(new ace.UndoManager());
    },
});

module.exports = Editor;
