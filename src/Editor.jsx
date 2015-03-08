var Editor = React.createClass({
    getInitialState: function() {
        return { text: '(defun hello (world))' };
    },
    render: function () {
        return (
            <textarea ref="text" readOnly value={this.state.text}></textarea>
        );
    },
    componentDidMount: function () {
        var cm = CodeMirror.fromTextArea(this.refs.text.getDOMNode(), {
            mode: "commonlisp",
            lineNumbers: true,
            lineWrapping: true,
            curserHeight: 0.9
        });
        this.setState({cm:cm});
    },
    shouldComponentUpdate: function() {
        if (this.state.cm) { this.state.cm.refresh(); }
        return false;
    },
});
