var Editor = React.createClass({
    render: function () {
        return (
            <div id={"Editor_"+this.props.filename}>Loading {this.props.filename}...</div>
        );
    },
    componentDidMount: function () {
        var editor = ace.edit("Editor_"+this.props.filename);
        $.ajax({
            url: "api/sharejs/open/"+this.props.filename,
            success: function(data) {
                sharejs.open(data.name, 'text', 'api/sharejs/channel', function(error, doc) {
                    doc.attach_ace(editor);
                    editor.focus();
                    editor.getSession().setMode("ace/mode/"+data.mode);
                });
            }
        });
    }
});
