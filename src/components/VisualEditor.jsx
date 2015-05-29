"use strict";

var React = require('react');

var Tree = require('borjes/src/tree');
var FStruct = require('borjes/src/types').FStruct;

var BorjesTree = require('./BorjesTree');

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
        return <BorjesTree tree={this.state.tree} />;
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
        var rowStyle = {
            border: "1px solid #666",
            margin: "0.5ex",
            marginRight: "1.5em"
        };
        var headerStyle = {
            background: "#ccd",
            padding: "0.5ex",
            textAlign: "right",
            cursor: "pointer",
        };
        var resultStyle = {
            padding: "0.5ex",
            overflow: 'auto'
        };
        return (<div>
            <h1>Rules</h1>
            <div>
                {rules.get().map((x, i) => <div key={i} style={rowStyle}>
                    <div style={headerStyle} onClick={this.toggleRow.bind(this, i)}>
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
