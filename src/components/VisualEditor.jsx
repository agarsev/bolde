"use strict";

var React = require('react');
var Bjs = require('borjes');
var Tree = Bjs.tree;
var Rule = Bjs.rule;
var Lattice = Bjs.types.Lattice;
var FStruct = Bjs.types.FStruct;
var World = Bjs.types.World;

var BorjesReact = require('borjes-react');
var BorjesProtoLattice = require('borjes-react/dist/BorjesProtoLattice');

require('styles/tree');

class RuleEditor extends React.Component {

    constructor(props) {
        super(props);
        var doc = this.props.doc;
        var mother = doc.at('m').get();
        var daughters = doc.at('d').get();
        this.state = { tree: Tree(mother, [daughters[0], daughters[1]]), editable: false };
        doc.on('child op', () => {
            var mi = doc.at('m').get();
            var dou = doc.at('d').get();
            this.setState({ tree: Tree(mi, [dou[0], dou[1]]) });
        });
    }

    update (x) {
        var doc = this.props.doc;
        var mother = doc.at('m').get();
        var daughters = doc.at('d').get();
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

class VisualEditor extends React.Component {

    constructor (props) {
        super(props);
        var doc = window.FileStore.getFile(this.props.filename).doc;
        var rules, lexicon, global;
        try {
            rules = doc.at('rules').get();
            lexicon = doc.at('lexicon').get();
            global = doc.at('global').get();
        } catch (e) { }
        if (!rules || !lexicon || !global) {
            rules = rules || [];
            lexicon = lexicon || [];
            global = global || { signature: {} };
            doc.at().set({ rules, lexicon, global });
        }
        doc.on('change', () => this.forceUpdate());
        this.state = { doc, open: {}, sigEdit: false };
    }

    add () {
        var doc = this.state.doc;
        var mo = FStruct();
        World.bind(World(), mo);
        doc.at('rules').push(Rule(mo, [FStruct(), FStruct()]));
    }

    delete (path, i) {
        var doc = this.state.doc;
        doc.at(path).at(i).remove();
    }

    toggleRow (i) {
        var open = this.state.open;
        open[i] = !open[i];
        this.setState({open: open});
    }

    editToggle (i, e) {
        if (i === 'SIG') {
            this.setState({sigEdit: !this.state.sigEdit});
        } else {
            this.refs["rule"+i].editToggle();
        }
        e.stopPropagation();
    }

    updateSignature (x) {
        this.state.doc.at('global').at('signature').set(x);
    }

    render () {
        var protosig = this.state.doc.at('global').at('signature').get();
        var signature = Lattice.fromProto(protosig);
        var cpbuffer = {};
        var rules = this.state.doc.at('rules');
        var lexicon = this.state.doc.at('lexicon').get();
        return (<div>
            <h1>Signature</h1>
            <span onClick={this.editToggle.bind(this, 'SIG')}>edit</span>
            <div>
                <BorjesProtoLattice x={protosig} update={this.updateSignature.bind(this)} opts={{editable:this.state.sigEdit}} />
            </div>
            <h1>Rules</h1>
            <div>
                {rules.get().map((x, i) => <div key={i} className="tree_row">
                    <div className="tree_header" onClick={this.toggleRow.bind(this, i)}>
                        <span onClick={this.editToggle.bind(this, i)}>edit</span>
                        <span onClick={this.delete.bind(this, 'rules', i)}>remove</span>
                    </div>
                    {this.state.open[i]?<RuleEditor ref={"rule"+i} doc={rules.at(i)} sig={signature} cpbuffer={cpbuffer} />:null}
                </div>)}
                <div><button onClick={this.add.bind(this)}>Add</button></div>
            </div>
            <h1>Lexicon</h1>
            <div>
                {lexicon.map((x, i) => <div key={i}>{x}</div>)}
                <div><button onClick={this.add.bind(this)}>Add</button></div>
            </div>
        </div>);
    }

}

module.exports = VisualEditor;
