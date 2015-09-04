"use strict";

var React = require('react');
var Bjs = require('borjes');
var World = Bjs.types.World;

var BorjesReact = require('borjes-react');

class PrincipleEditor extends React.Component {

    constructor(props) {
        super(props);
        var doc = this.props.doc;
        var ante = doc.at('a').get();
        var cons = doc.at('c').get();
        this.state = { ante, cons, editable: false };
        doc.on('child op', () => {
            var an = doc.at('a').get();
            var co = doc.at('c').get();
            this.setState({ ante, cons });
        });
    }

    update (who, x) {
        var doc = this.props.doc;
        var oldworld = this.state[who=='a'?'ante':'cons'].borjes_bound;
        if (!Bjs.types.eq(x, Bjs.types.Anything)) {
            World.bind(oldworld, x);
        }
        doc.at(who).set(x);
        this.setState(who=='a'?{ante: x}:{cons: x});
    }

    editToggle () {
        this.setState({editable: !this.state.editable});
    }

    render () {
        var a = this.state.ante;
        var c = this.state.cons;
        return <span className="borjes">
            <BorjesReact x={a} cpbuffer={this.props.cpbuffer} update={this.update.bind(this, 'a')} opts={{editable:this.state.editable, signature:this.props.sig}}/>
            {"⇒"}
            <BorjesReact x={c} cpbuffer={this.props.cpbuffer} update={this.update.bind(this, 'c')} opts={{editable:this.state.editable, signature:this.props.sig}}/>
        </span>;
    }
}

module.exports = PrincipleEditor;
