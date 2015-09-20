"use strict";

var React = require('react');
var t = require('tcomb-form');
var Bjs = require('borjes');
var Tree = Bjs.Tree;
var World = Bjs.types.World;
var FStruct = Bjs.types.FStruct;
var Variable = Bjs.types.Variable;
var Rule = Bjs.Rule;

var BorjesReact = require('borjes-react');

var Row = require('../Row');
var Actions = require('../../Actions');

class RuleEditor extends React.Component {

    constructor(props) {
        super(props);
        var doc = this.props.doc;
        if (doc.at().get()===null) {
            var mo = FStruct();
            var w = World();
            var ld = Variable(w, FStruct());
            var rd = Variable(w, FStruct());
            World.bind(w, mo);
            doc.at().set(Rule(mo, [ld, rd]));
        }
        var mother = doc.at('m').get();
        var daughters = doc.at('d').get();
        var tree = Tree(mother, [daughters[0], daughters[1]]);
        World.bind(mother.borjes_bound, tree);
        this.state = { tree, editable: false };
        doc.on('child op', () => {
            var mi = doc.at('m').get();
            var dou = doc.at('d').get();
            var tree = Tree(mi, [dou[0], dou[1]]);
            World.bind(mi.borjes_bound, tree);
            this.setState({ tree });
        });
    }

    update (x) {
        var doc = this.props.doc;
        var oldworld = this.state.tree.borjes_bound;
        if (!Bjs.types.eq(x.node, Bjs.types.Anything)) {
            World.bind(oldworld, x.node);
        }
        World.bind(oldworld, x);
        doc.at('m').set(x.node);
        doc.at('d').at(0).set(x.children[0]);
        doc.at('d').at(1).set(x.children[1]);
        this.setState({tree: x});
    }

    editToggle (e) {
        var ed = this.state.editable;
        if (!ed) {
            this.refs['row'].open();
        }
        this.setState({editable: !this.state.editable});
        if (e) { e.stopPropagation(); }
    }

    open () {
        this.refs['row'].open();
    }

    changeName (e) {
        var doc = this.props.doc;
        Actions.prompt({
            model: t.struct({ name: t.Str }),
            value: { name: doc.at('name').get() }
        }).then(data => {
            doc.at('name').set(data.name);
        }).catch(() => {});
        e.stopPropagation();
    }

    render () {
        return <Row ref="row" title={this.props.doc.at('name').get()} initShown={false} collapsable={true} actions={{
            edit: this.editToggle.bind(this),
            name: this.changeName.bind(this),
            remove: this.props.rm
            }}>
            <BorjesReact x={this.state.tree} cpbuffer={this.props.cpbuffer} update={this.update.bind(this)} opts={{editable:this.state.editable, signature:this.props.sig}}/>
        </Row>;
    }
}

module.exports = RuleEditor;
