"use strict";

var React = require('react');

require('../../bower_components/ace-builds/src-min-noconflict/ace.js');
require('../../bower_components/ace-builds/src-min-noconflict/ext-settings_menu.js');
ace.config.set("basePath", "ace");

class Editor extends React.Component {

    render () {
        return (
            <div id={"Editor_"+this.props.filename}></div>
        );
    }

    init (editor) {
        ace.require('ace/ext/settings_menu').init(editor);
        editor.commands.addCommands([{
            name: "showSettingsMenu",
            bindKey: { win: "Ctrl-k", mac: "Command-k"},
            exec: function(editor) {
                editor.showSettingsMenu();
            },
            readOnly: true
        }]);
        editor.getSession().setUseWrapMode(true);
        var settings = window.UserStore.getSettings();
        if (!!settings.editor && settings.editor != "default") {
            editor.setKeyboardHandler("ace/keyboard/"+settings.editor);
        }
        editor.focus();
    }

    componentDidMount () {
        var editor = ace.edit("Editor_"+this.props.filename);
        this.init(editor);
        var file = window.FileStore.getFile(this.props.filename);
        if (file.readonly) {
            editor.setOptions({ readOnly: true });
        }
        file.doc.attach_ace(editor);
        editor.getSession().setMode("ace/mode/"+file.mode);
        editor.getSession().setUndoManager(new ace.UndoManager());
    }

};

module.exports = Editor;
