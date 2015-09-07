"use strict";

var React = require('react');
var Bjs = require('borjes');
var Tree = Bjs.Tree;
var World = Bjs.types.World;
var FStruct = Bjs.types.FStruct;
var Rule = Bjs.Rule;

var BorjesReact = require('borjes-react');

class RuleEditor extends React.Component {

    constructor(props) {
        super(props);
        var doc = this.props.doc;
        if (doc.at().get()===null) {
            var mo = FStruct();
            World.bind(World(), mo);
            doc.at().set(Rule(mo, [FStruct(), FStruct()]));
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

    editToggle () {
        this.setState({editable: !this.state.editable});
    }

    render () {
        return <BorjesReact x={this.state.tree} cpbuffer={this.props.cpbuffer} update={this.update.bind(this)} opts={{editable:this.state.editable, signature:this.props.sig}}/>;
    }
}

module.exports = RuleEditor;
