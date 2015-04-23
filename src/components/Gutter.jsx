"use strict";

var React = require('react');

class Gutter extends React.Component {

    constructor (props) {
        super(props);
        if (this.props.dir=="right") {
            this.state = { handler: function(e) {
                this.style.width = e.clientX+"px";
            }};
        } else {
            this.state = { handler: function(e) {
                this.style.width = (document.body.clientWidth-e.clientX)+"px";
            }};
        }
    }

    render () {
        return (
            <div onMouseDown={this.handleMouse.bind(this)}
                className="gutter" />
        );
    }

    handleMouse (e) {
        document.onmousemove = this.state.handler.bind(this.props.getTarget());
        document.onmouseup = function() {
            document.onmousemove = null;
        };
        e.preventDefault();
    }

};

module.exports = Gutter;
