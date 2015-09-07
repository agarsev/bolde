"use strict";

var React = require('react');
var Bjs = require('borjes');

var Row = require('../Row');

var BorjesReact = require('borjes-react');

class ParadigmEditor extends React.Component {

    constructor(props) {
        super(props);
        var doc = this.props.doc;
        this.state = { x: Bjs.types.Anything, editable: false };
        doc.on('child op', () => {
            //this.setState({ tree });
        });
    }

    update (x) {
        var doc = this.props.doc;
        this.setState({x});
    }

    open () {
        this.refs['row'].open();
    }

    editToggle (e) {
        var ed = this.state.editable;
        if (!ed) {
            this.refs['row'].open();
        }
        this.setState({editable: !this.state.editable});
        if (e) { e.stopPropagation(); }
    }

    render () {
        return <Row ref="row" collapsable={true} initShown={false} actions={{ edit: this.editToggle.bind(this) }}>
            <BorjesReact x={this.state.x} cpbuffer={this.props.cpbuffer} update={this.update.bind(this)} opts={{editable:this.state.editable, signature:this.props.sig}}/>
            <table>
            <tr><td>Pepa</td><td>Pase</td><td>Kozu</td></tr>
            </table>
        </Row>;
    }
}

module.exports = ParadigmEditor;
