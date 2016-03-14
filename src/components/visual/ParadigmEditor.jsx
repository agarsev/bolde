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
            var common = World();
            var lex = Variable(common, Anything);
            var morph = Variable(common, Anything);
            common.titles[lex.index] = 'Root';
            common.titles[morph.index] = 'Morph';
            doc.at().set({ common, values: [['','',Anything,FStruct()]], lexemes: [], nparams: 2, name: 'Paradigm' });
        }
        this.state = { editV: doc.at('values').get().map(() => false), editL: doc.at('lexemes').get().map(() => false) };
        doc.on('child op', () => {
            this.forceUpdate();
        });
    }

    updateValue (i, x) {
        var doc = this.props.doc;
        if (x.borjes_bound) {
            doc.at('common').set(x.borjes_bound);
        }
        doc.at(['values', i, 3]).set(x);
    }

    updateGuard (i, x) {
        var doc = this.props.doc;
        if (x.borjes_bound) {
            doc.at('common').set(x.borjes_bound);
        }
        doc.at(['values', i, 2]).set(x);
    }

    addVal () {
        var doc = this.props.doc;
        doc.at('values').push(['', '', Anything, FStruct()]);
    }

    rmVal (i) {
        var doc = this.props.doc;
        doc.at('values', i).remove();
    }

    updateReg (i, j, e) {
        var doc = this.props.doc;
        var v = e.target.value;
        doc.at('values', i, j).set(v);
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
        var wdoc = doc.at('common');
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
        var wdoc = doc.at('common');
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

    editToggle (what, who, e) {
        var edi;
        if (what == 'v') {
            edi = this.state.editV;
        } else {
            edi = this.state.editL;
        }
        edi[who] = !edi[who];
        this.setState(this.state);
        if (e) { e.stopPropagation(); }
    }

    copyParam (i) {
        this.props.cpbuffer.v = {
            borjes: 'variable',
            index: i
        };
    }

    editParam (i) {
        var wdoc = this.props.doc.at('common');
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
        var w = doc.at('common').get();
        var lex = doc.at('lexemes').get();
        var vals = doc.at('values').get();
        var nparams = doc.at('nparams').get();

        var editV = this.state.editV;
        var editL = this.state.editL;

        var params = [];
        for (var i=0; i<nparams; i++) {
            if (i==1) {
                params.push(<td key="1">Class</td>);
            } else {
                params.push(<td key={i}>
                    <span className="borjes_variable" onDoubleClick={this.editParam.bind(this,i)}>
                        {w.titles[i]}
                    </span>
                    <button onClick={this.copyParam.bind(this, i)}>c</button>
                </td>);
            }
        }
        return <Row ref="row" title={doc.at('name').get()} collapsable={true} initShown={false} actions={{
            name: this.changeName.bind(this),
            remove: this.props.rm
            }}>
            <table className="borjes paradigm_editor"><tbody>
            <tr key="val-1"><td>
                <span className="borjes_variable" onDoubleClick={this.editParam.bind(this,1)}>
                    {w.titles[1]}
                </span>
                <button onClick={this.copyParam.bind(this, 1)}>c</button>
            </td><td>Class</td><td>Template</td><td></td></tr>
            {vals.map((v, i) => {
                var edi = editV[i];
                World.bind(w, v[2]);
                World.bind(w, v[3]);
                return <tr key={"val"+i}>
                    <td>
                    {edi?<input type="text" onChange={this.updateReg.bind(this,i,0)} value={v[0]} />:v[0]}
                    {'⭢'}
                    {edi?<input type="text" onChange={this.updateReg.bind(this,i,1)} value={v[1]} />:v[1]}
                    </td>
                    <td><BorjesReact x={v[2]} cpbuffer={this.props.cpbuffer} update={this.updateGuard.bind(this, i)} opts={{editable:edi, signature:this.props.sig}}/></td>
                    <td><BorjesReact x={v[3]} cpbuffer={this.props.cpbuffer} update={this.updateValue.bind(this, i)} opts={{editable:edi, signature:this.props.sig}}/></td>
                    <td>
                        {edi?<button onClick={this.rmVal.bind(this,i)}>x</button>:null}
                        <button onClick={this.editToggle.bind(this,'v',i)}>{edi?'ok':'e'}</button>
                    </td>
                </tr>;
            })}
            </tbody></table>
            <span className="borjes"><button onClick={this.addVal.bind(this)}>+</button></span>
            <table className="borjes paradigm_editor"><tbody>
            <tr key="tr-1">
                {params}
                <td>
                    <button onClick={this.addParam.bind(this)}>+</button>
                    {nparams>1?<button onClick={this.rmParam.bind(this)}>-</button>:null}
                </td>
            </tr>
            {lex.map((l, i) => <tr key={"tr"+i}>
                {l.map((n, j) => <td key={j}>
                    {j==0?n:
                    <BorjesReact x={n} cpbuffer={this.props.cpbuffer} update={this.updateLex.bind(this, i, j)} opts={{editable:editL[i], signature:this.props.sig}}/>}
                </td>)}
                <td>
                    {editL[i]?<button onClick={this.rm.bind(this, i)}>x</button>:null}
                    <button onClick={this.editToggle.bind(this, 'l', i)}>{editL[i]?'ok':'e'}</button>
                </td>
            </tr>)}
            </tbody></table>
            <span className="borjes"><input ref="addLex" type="text" /><button onClick={this.add.bind(this)}>+</button></span>
        </Row>;
    }
}

module.exports = ParadigmEditor;
