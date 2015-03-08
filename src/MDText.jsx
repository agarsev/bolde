var md = window.markdownit();

var MDText = React.createClass({
    render: function() {
        var rawMarkup = md.render(this.props.text);
        return (<div className="paper" dangerouslySetInnerHTML={{__html: rawMarkup}} />);
    }
});
