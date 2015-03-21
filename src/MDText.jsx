var React = require('../bower_components/react/react.js');
var markdownit = require('../bower_components/markdown-it/dist/markdown-it.min.js');

var md = markdownit();

var MDText = React.createClass({
    render: function() {
        var rawMarkup = md.render(this.props.text);
        return (<div className="paper" dangerouslySetInnerHTML={{__html: rawMarkup}} />);
    }
});

module.exports = MDText;
