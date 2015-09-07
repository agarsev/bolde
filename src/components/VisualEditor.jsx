"use strict";

var React = require('react');
var Bjs = require('borjes');
var Lattice = Bjs.types.Lattice;

var BorjesReact = require('borjes-react');
var BorjesProtoLattice = require('borjes-react/dist/BorjesProtoLattice');

var Row = require('./Row');

var RuleEditor = require('./visual/RuleEditor');
var PrincipleEditor = require('./visual/PrincipleEditor');
var ParadigmEditor = require('./visual/ParadigmEditor');

require('styles/visual');

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
            lexicon = lexicon || [];
            global = global || { signature: {} };
            doc.set({ rules, principles: pples, lexicon, global });
        }
        doc.on('change', () => this.forceUpdate());
        this.state = { doc, sigEdit: false, cpbuffer: {} };
    }

    add (path, ref) {
        var doc = this.state.doc;
        doc.at(path).push(null);
        var i = doc.at(path).get().length-1;
        setTimeout(() => this.refs['row'+ref+i].open(), 0);
    }

    delete (path, i) {
        var doc = this.state.doc;
        doc.at(path).at(i).remove();
    }

    editToggle (i, e) {
        this.setState({sigEdit: !this.state.sigEdit});
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
                <Row actions={{edit: this.editToggle.bind(this)}}>
                    <BorjesProtoLattice x={protosig} update={this.updateSignature.bind(this)} opts={{editable:this.state.sigEdit}} />
                </Row>
            </div>
            <h1>Rules</h1>
            <div style={{paddingRight: '1em'}}>
                {rules.get().map((x, i) => <RuleEditor key={"rule"+i} ref={"rowrule"+i} doc={rules.at(i)} sig={signature} cpbuffer={this.state.cpbuffer} rm={this.delete.bind(this, 'rules', i)} />)}
                <div key="addRule"><button onClick={this.add.bind(this, 'rules', 'rule')}>Add</button></div>
            </div>
            <h1>Principles</h1>
            <div style={{paddingRight: '1em'}}>
                {pples.get().map((x, i) => <PrincipleEditor key={"pple"+i} ref={"rowpple"+i} doc={pples.at(i)} sig={signature} cpbuffer={this.state.cpbuffer} rm={this.delete.bind(this, 'principles', i)} />)}
                <div key="addPple"><button onClick={this.add.bind(this, 'principles', 'pple')}>Add</button></div>
            </div>
            <h1>Lexicon</h1>
            <div style={{paddingRight: '1em'}}>
                {lexicon.get().map((x, i) => <ParadigmEditor key={"lex"+i} ref={"rowlex"+i} doc={lexicon.at(i)} sig={signature} cpbuffer={this.state.cpbuffer} rm={this.delete.bind(this, 'lexicon', i)} />)}
                <div key="addLex"><button onClick={this.add.bind(this, 'lexicon', 'lex')}>Add</button></div>
            </div>
        </div>);
    }

}

module.exports = VisualEditor;
