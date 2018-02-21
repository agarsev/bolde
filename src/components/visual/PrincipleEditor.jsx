"use strict";

var React = require('react');
var t = require('tcomb-form');
var Bjs = require('borjes');
var World = Bjs.types.World;
var Principle = Bjs.Principle;
var FStruct = Bjs.types.FStruct;

var BorjesReact = require('borjes-react').Component;

var Row = require('../Row');
var Actions = require('../../Actions');

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
        var oldworld = doc.at(who, 'borjes_bound').get() || World();
        if (!Bjs.types.eq(x, Bjs.types.Anything)) {
            World.bind(oldworld, x);
        }
        doc.at(who).set(x);
    }

    editToggle (e) {
        var ed = this.state.editable;
        if (!ed) {
            this._row.open();
        }
        this.setState({editable: !this.state.editable});
        if (e) { e.stopPropagation(); }
    }

    open () {
        this._row.open();
    }

    changeName (e) {
        var doc = this.props.doc;
        Actions.prompt({
            model: t.struct({ name: t.Str }),
            value: { name: doc.at('name').get() }
        }).then(data => {
            doc.at('name').set(data.name);
        }).catch(() => {});
    }

    render () {
        var doc = this.props.doc;
        var a = doc.at('a').get();
        var c = doc.at('c').get();
        return <Row ref={d=>this._row=d} title={doc.at('name').get()} initShown={false} collapsable={true} actions={this.props.editable?{
            edit: this.editToggle.bind(this),
            name: this.changeName.bind(this),
            remove: this.props.rm
            }:null}><span className="borjes">
            <BorjesReact x={a} cpbuffer={this.props.cpbuffer} update={this.update.bind(this, 'a')} opts={{editable:this.state.editable, signature:this.props.sig}}/>
            {"⇒"}
            <BorjesReact x={c} cpbuffer={this.props.cpbuffer} update={this.update.bind(this, 'c')} opts={{editable:this.state.editable, signature:this.props.sig}}/>
        </span></Row>;
    }
}

module.exports = PrincipleEditor;
