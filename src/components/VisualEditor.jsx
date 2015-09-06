"use strict";

var React = require('react');
var Bjs = require('borjes');
var Rule = Bjs.Rule;
var Principle = Bjs.Principle;
var Lattice = Bjs.types.Lattice;
var FStruct = Bjs.types.FStruct;
var World = Bjs.types.World;

var BorjesReact = require('borjes-react');
var BorjesProtoLattice = require('borjes-react/dist/BorjesProtoLattice');

var Row = require('./Row');

var RuleEditor = require('./visual/RuleEditor');
var PrincipleEditor = require('./visual/PrincipleEditor');
var LexEditor = require('./visual/LexEditor');

require('styles/tree');

class VisualEditor extends React.Component {

    constructor (props) {
        super(props);
        var doc = window.FileStore.getFile(this.props.filename).doc;
        var rules, pples, lexicon, global;
        try {
            rules = doc.at('rules').get();
            pples = doc.at('principles').get();
            lexicon = doc.at('lexicon').get();
            global = doc.at('global').get();
        } catch (e) { }
        if (!rules || !lexicon || !global || ! pples) {
            rules = rules || [];
            pples = pples || [];
            lexicon = lexicon || {};
            global = global || { signature: {} };
            doc.at().set({ rules, principles: pples, lexicon, global });
        }
        doc.on('change', () => this.forceUpdate());
        this.state = { doc, sigEdit: false, cpbuffer: {} };
    }

    addRule () {
        var doc = this.state.doc;
        var mo = FStruct();
        World.bind(World(), mo);
        doc.at('rules').push(Rule(mo, [FStruct(), FStruct()]));
    }

    addPple () {
        var doc = this.state.doc;
        var ante = FStruct();
        var cons = FStruct();
        World.bind(World(), ante);
        World.bind(World(), cons);
        doc.at('principles').push(Principle(ante, cons));
    }

    addLex () {
        var doc = this.state.doc;
        var val = React.findDOMNode(this.refs.addLext).value;
        var lex = doc.at('lexicon');
        if (lex.at(val).get()===undefined) {
            lex.at(val).set(Bjs.types.Anything);
        }
    }

    delete (path, i) {
        var doc = this.state.doc;
        doc.at(path).at(i).remove();
    }

    editToggle (i, e) {
        if (i === 'SIG') {
            this.setState({sigEdit: !this.state.sigEdit});
        } else {
            this.refs['row'+i].open();
            setTimeout(() => this.refs[i].editToggle(), 0);
        }
        e.stopPropagation();
    }

    updateSignature (x) {
        this.state.doc.at('global').at('signature').set(x);
    }

    render () {
        var protosig = this.state.doc.at('global').at('signature').get();
        var signature = Lattice.fromProto(protosig, 'signature');
        var rules = this.state.doc.at('rules');
        var pples = this.state.doc.at('principles');
        var lexicon = this.state.doc.at('lexicon');
        return (<div>
            <h1>Signature</h1>
            <div style={{paddingRight: '1em'}}>
                <Row actions={{edit: this.editToggle.bind(this, 'SIG')}}>
                    <BorjesProtoLattice x={protosig} update={this.updateSignature.bind(this)} opts={{editable:this.state.sigEdit}} />
                </Row>
            </div>
            <h1>Rules</h1>
            <div style={{paddingRight: '1em'}}>
                {rules.get().map((x, i) => <Row initShown={false} collapsable={true} ref={"rowrule"+i} key={"rule"+i} actions={{
                    'edit': this.editToggle.bind(this, "rule"+i),
                    'remove': this.delete.bind(this, 'rules', i)}}>
                    <RuleEditor ref={"rule"+i} doc={rules.at(i)} sig={signature} cpbuffer={this.state.cpbuffer} />
                </Row>)}
                <div key="addRule"><button onClick={this.addRule.bind(this)}>Add</button></div>
            </div>
            <h1>Principles</h1>
            <div style={{paddingRight: '1em'}}>
                {pples.get().map((x, i) => <Row initShown={false} collapsable={true} ref={"rowpple"+i} key={"pple"+i} actions={{
                    'edit': this.editToggle.bind(this, "pple"+i),
                    'remove': this.delete.bind(this, 'principles', i)}}>
                    <PrincipleEditor ref={"pple"+i} doc={pples.at(i)} sig={signature} cpbuffer={this.state.cpbuffer} />
                </Row>)}
                <div key="addPple"><button onClick={this.addPple.bind(this)}>Add</button></div>
            </div>
            <h1>Lexicon</h1>
            <div>
                {Object.keys(lexicon.get()).map((k) => <div key={"lex"+k} className="borjes tree_row">
                    <button onClick={this.delete.bind(this, 'lexicon', k)}>x</button>
                    <LexEditor word={k} ref={"lex"+k} doc={lexicon.at(k)} sig={signature} cpbuffer={this.state.cpbuffer} />
                </div>)}
                <div key="addLex"><input type="text" ref="addLext" /><button onClick={this.addLex.bind(this)}>+</button></div>
            </div>
        </div>);
    }

}

module.exports = VisualEditor;
