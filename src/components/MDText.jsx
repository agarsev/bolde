"use strict";

var React = require('react');
var ReactDOM = require('react-dom');
var markdownit = require('markdown-it');

var md = markdownit({html: true});

class MDText extends React.Component {

    render () {
        var rawMarkup = md.render(this.props.text);
        return (<div ref={d=>this._div=d} className="paper" dangerouslySetInnerHTML={{__html: rawMarkup}} />);
    }

    componentDidMount () {
        if (this.props.links) {
            var Links = this.props.links;
            var as = ReactDOM.findDOMNode(this._div).querySelectorAll('a');
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

};

module.exports = MDText;
