"use strict";

var React = require('react');
var Bjs = require('borjes');
var Tree = Bjs.tree;
var FStruct = Bjs.types.FStruct;

var BorjesReact = require('borjes-react');

require('styles/tree');

class RuleEditor extends React.Component {

    constructor(props) {
        super(props);
        var doc = this.props.doc;
        var mother, left, right;
        try {
            mother = doc.at('mother').get();
            left = doc.at('left').get();
            right = doc.at('right').get();
        } catch (e) { }
        if (!mother || !left || !right) {
            mother = mother || FStruct({symbol: 'mother'});
            left = left || FStruct({symbol: 'left'});
            right = right || FStruct({symbol: 'right'});
            doc.at().set({mother, left, right});
        }
        this.state = { tree: Tree(mother, [Tree(left), Tree(right)]) };
    }

    render () {
        return <BorjesReact x={this.state.tree} />;
    }
}

class VisualEditor extends React.Component {

    constructor (props) {
        super(props);
        var doc = window.FileStore.getFile(this.props.filename).doc;
        var rules, lexicon;
        try {
            rules = doc.at('rules').get();
            lexicon = doc.at('lexicon').get();
        } catch (e) { }
        if (!rules || !lexicon) {
            rules = rules || [];
            lexicon = lexicon || [];
            doc.at().set({ rules, lexicon });
        }
        doc.on('change', () => this.forceUpdate());
        this.state = { doc, open: {} };
    }

    add () {
        var doc = this.state.doc;
        doc.at('rules').push({});
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

    render () {
        var rules = this.state.doc.at('rules');
        var lexicon = this.state.doc.at('lexicon').get();
        return (<div>
            <h1>Rules</h1>
            <div>
                {rules.get().map((x, i) => <div key={i} className="tree_row">
                    <div className="tree_header" onClick={this.toggleRow.bind(this, i)}>
                        <span onClick={this.delete.bind(this, 'rules', i)}>remove</span>
                    </div>
                    {this.state.open[i]?<RuleEditor doc={rules.at(i)} />:null}
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
