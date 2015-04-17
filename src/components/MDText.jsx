var React = require('react');
var markdownit = require('../bower_components/markdown-it/dist/markdown-it.min.js');

var md = markdownit();

var MDText = React.createClass({
    render: function() {
        var rawMarkup = md.render(this.props.text);
        return (<div ref="div" className="paper" dangerouslySetInnerHTML={{__html: rawMarkup}} />);
    },
    componentDidMount: function() {
        if (this.props.links) {
            var Links = this.props.links;
            var as = this.refs.div.getDOMNode().querySelectorAll('a');
            for(var i=0; i<as.length; i++) {
                var hash = as[i].href.search(/#.*$/);
                if (hash>0) {
                    as[i].onclick = function(e) {
                        Links(this.href.substr(hash+1));
                    };
                }
            }
        }
    }
});

module.exports = MDText;
