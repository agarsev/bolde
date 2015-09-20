"use strict";

var React = require('react');
var Bjs = require('borjes');
var t = require('tcomb-form');

var Actions = require('../../Actions');
var World = Bjs.types.World;
var Variable = Bjs.types.Variable;
var FStruct = Bjs.types.FStruct;
var Anything = Bjs.types.Anything;

var Row = require('../Row');

var BorjesReact = require('borjes-react');

class ParadigmEditor extends React.Component {

    constructor(props) {
        super(props);
        var doc = this.props.doc;
        if (doc.at().get() === null) {
            var value = FStruct();
            var common = World();
            World.bind(common, value);
            var v = Variable(common, Anything);
            common.titles[v.index] = 'Lexeme';
            doc.at().set({ value, lexemes: [], nparams: 1, name: 'Paradigm' });
        }
        this.state = { editable: false };
        doc.on('child op', () => {
            this.forceUpdate();
        });
    }

    updateValue (x) {
        var doc = this.props.doc;
        var oldworld = doc.at('value', 'borjes_bound').get() || World();
        World.bind(oldworld, x);
        doc.at('value').set(x);
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

    add () {
        var doc = this.props.doc;
        var word = React.findDOMNode(this.refs.addLex).value;
        var nparams = doc.at('nparams').get();
        if (word.length>0) {
            var val = [word];
            for (var i=1; i<nparams; i++) {
                val.push(Anything);
            };
            doc.at('lexemes').push(val);
        }
    }

    addParam () {
        var doc = this.props.doc;
        var wdoc = doc.at('value').at('borjes_bound');
        var nparams = doc.at('nparams');
        var w = wdoc.get();
        var v, inc = false;
        if (nparams.get() < w.values.length) {
            v = { borjes: 'variable', index: nparams.get() };
        } else {
            v = Variable(w, Anything);
            wdoc.set(w);
        }
        var lex = doc.at('lexemes');
        lex.get().forEach((v, i) => {
            lex.at(i).push(Anything);
        });
        nparams.add(1);
    }

    rmParam () {
        var doc = this.props.doc;
        var wdoc = doc.at('value').at('borjes_bound');
        var nparams = doc.at('nparams');
        var lex = doc.at('lexemes');
        var last = nparams.get()-1;
        lex.get().forEach((v, i) => {
            lex.at([i, last]).remove();
        });
        nparams.add(-1);
    }

    rm (i) {
        var doc = this.props.doc;
        doc.at('lexemes').at(i).remove();
    }

    editToggle (e) {
        var ed = this.state.editable;
        if (!ed) {
            this.refs['row'].open();
        }
        this.setState({editable: !this.state.editable});
        if (e) { e.stopPropagation(); }
    }

    copyParam (i) {
        this.props.cpbuffer.v = {
            borjes: 'variable',
            index: i
        };
    }

    editParam (i) {
        var wdoc = this.props.doc.at('value').at('borjes_bound');
        var w = wdoc.get();
        Actions.prompt({
            model: t.struct({ name: t.Str }),
            value: { name: w.titles[i] }
        }).then((data) => {
            w.titles[i] = data.name;
            wdoc.set(w);
        }).catch(() => {});
    }

    updateLex (i, j, x) {
        this.props.doc.at('lexemes', i, j).set(x);
    }

    render () {
        var doc = this.props.doc;
        var x = doc.at('value').get();
        var w = x.borjes_bound;
        var lex = doc.at('lexemes').get();
        var nparams = doc.at('nparams').get();
        var edi = this.state.editable;

        var params = [];
        for (var i=0; i<nparams; i++) {
            params.push(<td key={i}>
                <span className="borjes_variable" onDoubleClick={this.editParam.bind(this,i)}>
                    {w.titles[i]}
                </span>
                {edi?<button onClick={this.copyParam.bind(this, i)}>c</button>:null}
            </td>);
        }
        return <Row ref="row" title={doc.at('name').get()} collapsable={true} initShown={false} actions={{
            edit: this.editToggle.bind(this),
            name: this.changeName.bind(this),
            remove: this.props.rm
            }}>
            <BorjesReact x={x} cpbuffer={this.props.cpbuffer} update={this.updateValue.bind(this)} opts={{editable:edi, signature:this.props.sig}}/>
            <table className="borjes paradigm_editor"><tbody>
            <tr key="tr-1">
                {params}
                {edi?<td>
                    <button onClick={this.addParam.bind(this)}>+</button>
                    <button onClick={this.rmParam.bind(this)}>-</button>
                </td>:null}
            </tr>
            {lex.map((l, i) => <tr key={"tr"+i}>
                {params.map((n, j) => <td key={j}>
                    {j==0?l[j]:
                    <BorjesReact x={l[j]} cpbuffer={this.props.cpbuffer} update={this.updateLex.bind(this, i, j)} opts={{editable:this.state.editable, signature:this.props.sig}}/>}
                </td>)}
                {edi?<td><button onClick={this.rm.bind(this, i)}>x</button></td>:null}
            </tr>)}
            </tbody></table>
            {edi?<span className="borjes"><input ref="addLex" type="text" /><button onClick={this.add.bind(this)}>+</button></span>:null}
        </Row>;
    }
}

module.exports = ParadigmEditor;
