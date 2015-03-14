var CodeMirrorDocs = {};

var Editor = React.createClass({
    getInitialState: function() {
        return {}
    },
    render: function () {
        return (
            <div ref="text">Loading file</div>
        );
    },
    componentWillUnmount: function () {
        this.state.cm.swapDoc(CodeMirror.Doc('none'));
    },
    init: function () {
        var text = this.refs.text.getDOMNode();
        text.innerHTML = '';
        var cm = CodeMirror(text, {
            lineNumbers: true,
            lineWrapping: true,
            value: CodeMirrorDocs[this.props.filename]
        });
        this.setState({cm:cm});
    },
    componentDidMount: function () {
        var filename = this.props.filename;
        if (CodeMirrorDocs[filename]) {
            this.init();
        } else {
            $.ajax({
                url: "/api/file/"+filename,
                success: function(data) {
                    CodeMirrorDocs[filename] = CodeMirror.Doc(data.text, data.type);
                    this.init();
                }.bind(this)
            });
        }
    },
    shouldComponentUpdate: function() {
        if (this.state.cm) { this.state.cm.refresh(); }
        return false;
    },
});
