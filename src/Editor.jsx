// Editor
define(["require", "react/react", "ace/ace"], function (require, React) { return React.createClass({
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
        var This = this;
        require(["sjs/channel/bcsocket","sjs/share/share"], function() {
            $.ajax({
                url: "api/sharejs/open/"+This.props.filename,
                success: function(data) {
                    require(["sjs/share/ace"], function() {
                        sharejs.open(data.name, 'text',
                            location.href.substr(0, location.href.search(/\/[^\/]*$/))+'/api/sharejs/channel',
                            function(error, doc) {
                                doc.attach_ace(editor);
                                editor.getSession().setMode("ace/mode/"+data.mode);
                            }
                        );
                    });
                }
            });
        });
    }
});
});
