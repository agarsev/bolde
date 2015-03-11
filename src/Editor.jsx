var CodeMirrorDocs = {
    'default': CodeMirror.Doc('(defun hello (world))', 'commonlisp')
};

var Editor = React.createClass({
    getInitialState: function() {
        return {}
    },
    render: function () {
        return (
            <div ref="text"></div>
        );
    },
    componentWillUnmount: function () {
        this.state.cm.swapDoc(CodeMirror.Doc('none'));
    },
    componentDidMount: function () {
        var cm = CodeMirror(this.refs.text.getDOMNode(), {
            mode: "commonlisp",
            lineNumbers: true,
            lineWrapping: true,
            value: CodeMirrorDocs['default']
        });
        this.setState({cm:cm});
    },
    shouldComponentUpdate: function() {
        if (this.state.cm) { this.state.cm.refresh(); }
        return false;
    },
});
