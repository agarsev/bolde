"use strict";

var React = require('react');
var Bjs = require('borjes');
var Rule = Bjs.Rule;
var Lattice = Bjs.types.Lattice;
var FStruct = Bjs.types.FStruct;
var World = Bjs.types.World;

var BorjesReact = require('borjes-react');
var BorjesProtoLattice = require('borjes-react/dist/BorjesProtoLattice');

var RuleEditor = require('./visual/RuleEditor');
var LexEditor = require('./visual/LexEditor');

require('styles/tree');

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
            lexicon = lexicon || {};
            global = global || { signature: {} };
            doc.at().set({ rules, lexicon, global });
        }
        doc.on('change', () => this.forceUpdate());
        this.state = { doc, open: {}, sigEdit: false, cpbuffer: {} };
    }

    addRule () {
        var doc = this.state.doc;
        var mo = FStruct();
        World.bind(World(), mo);
        doc.at('rules').push(Rule(mo, [FStruct(), FStruct()]));
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

    toggleRow (i) {
        var open = this.state.open;
        open[i] = !open[i];
        this.setState({open: open});
    }

    editToggle (i, e) {
        if (i === 'SIG') {
            this.setState({sigEdit: !this.state.sigEdit});
        } else {
            this.refs[i].editToggle();
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
        var lexicon = this.state.doc.at('lexicon');
        return (<div>
            <h1>Signature</h1>
            <span onClick={this.editToggle.bind(this, 'SIG')}>edit</span>
            <div>
                <BorjesProtoLattice x={protosig} update={this.updateSignature.bind(this)} opts={{editable:this.state.sigEdit}} />
            </div>
            <h1>Rules</h1>
            <div>
                {rules.get().map((x, i) => <div key={"rule"+i} className="tree_row">
                    <div className="tree_header" onClick={this.toggleRow.bind(this, i)}>
                        <span onClick={this.editToggle.bind(this, "rule"+i)}>edit</span>
                        <span onClick={this.delete.bind(this, 'rules', i)}>remove</span>
                    </div>
                    {this.state.open[i]?<RuleEditor ref={"rule"+i} doc={rules.at(i)} sig={signature} cpbuffer={this.state.cpbuffer} />:null}
                </div>)}
                <div key="addRule"><button onClick={this.addRule.bind(this)}>Add</button></div>
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
