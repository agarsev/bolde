"use strict";

var React = require('react');
var Bjs = require('borjes');

var World = Bjs.types.World;

var BorjesReact = require('borjes-react');

class LexEditor extends React.Component {

    constructor(props) {
        super(props);
        var doc = this.props.doc;
        var value = doc.get();
        this.state = { value, editable: false };
    }

    update (value) {
        var doc = this.props.doc;
        if (!value.borjes_bound) {
            World.bind(World(), value);
        }
        doc.set(value);
        this.setState({value});
    }

    editToggle () {
        this.setState({editable: !this.state.editable});
    }

    render () {
        var w = this.props.word;
        var v = this.state.value;
        return <span>
            {w}:
            <BorjesReact x={v} cpbuffer={this.props.cpbuffer} update={this.update.bind(this)} opts={{editable:this.state.editable, signature:this.props.sig}}/>
            <button onClick={this.editToggle.bind(this)}>{this.state.editable?'ok':'edit'}</button>
        </span>;
    }
}

module.exports = LexEditor;
