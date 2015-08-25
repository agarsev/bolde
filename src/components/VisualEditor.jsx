"use strict";

var React = require('react');
var Bjs = require('borjes');
var Tree = Bjs.tree;
var Rule = Bjs.rule;
var FStruct = Bjs.types.FStruct;
var World = Bjs.types.World;

var BorjesReact = require('borjes-react');

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
        return <BorjesReact x={this.state.tree} update={this.update.bind(this)} opts={{editable:this.state.editable}}/>;
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
        this.refs["rule"+i].editToggle();
        e.stopPropagation();
    }

    render () {
        var rules = this.state.doc.at('rules');
        var lexicon = this.state.doc.at('lexicon').get();
        return (<div>
            <h1>Rules</h1>
            <div>
                {rules.get().map((x, i) => <div key={i} className="tree_row">
                    <div className="tree_header" onClick={this.toggleRow.bind(this, i)}>
                        <span onClick={this.editToggle.bind(this, i)}>edit</span>
                        <span onClick={this.delete.bind(this, 'rules', i)}>remove</span>
                    </div>
                    {this.state.open[i]?<RuleEditor ref={"rule"+i} doc={rules.at(i)} />:null}
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
