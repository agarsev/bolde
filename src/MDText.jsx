// MDText
define(["react/react", "markdown-it/markdown-it"], function (React, markdownit) {
var md = markdownit();
return React.createClass({
    render: function() {
        var rawMarkup = md.render(this.props.text);
        return (<div className="paper" dangerouslySetInnerHTML={{__html: rawMarkup}} />);
    }
});

}); // define
