"use strict";

var React = require('react');
var Bjs = require('borjes');
var World = Bjs.types.World;
var Principle = Bjs.Principle;
var FStruct = Bjs.types.FStruct;

var BorjesReact = require('borjes-react');

class PrincipleEditor extends React.Component {

    constructor(props) {
        super(props);
        var doc = this.props.doc;
        var ante;
        var cons;
        if (doc.at().get() === null) {
            ante = FStruct();
            cons = FStruct();
            World.bind(World(), ante);
            World.bind(World(), cons);
            doc.at().set(Principle(ante, cons));
        }
        this.state = { editable: false };
        doc.on('child op', () => {
            this.forceUpdate();
        });
    }

    update (who, x) {
        var doc = this.props.doc;
        var oldworld = doc.at(who, 'borjes_bound').get();
        if (!Bjs.types.eq(x, Bjs.types.Anything)) {
            World.bind(oldworld, x);
        }
        doc.at(who).set(x);
    }

    editToggle () {
        this.setState({editable: !this.state.editable});
    }

    render () {
        var doc = this.props.doc;
        var a = doc.at('a').get();
        var c = doc.at('c').get();
        return <span className="borjes">
            <BorjesReact x={a} cpbuffer={this.props.cpbuffer} update={this.update.bind(this, 'a')} opts={{editable:this.state.editable, signature:this.props.sig}}/>
            {"⇒"}
            <BorjesReact x={c} cpbuffer={this.props.cpbuffer} update={this.update.bind(this, 'c')} opts={{editable:this.state.editable, signature:this.props.sig}}/>
        </span>;
    }
}

module.exports = PrincipleEditor;
