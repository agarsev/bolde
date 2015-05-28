"use strict";

var React = require('react');

class VisualEditor extends React.Component {

    constructor (props) {
        super(props);
        var doc = window.FileStore.getFile(this.props.filename).doc;
        doc.on('change', () => this.forceUpdate());
        this.state = { doc };
    }

    add () {
        var doc = this.state.doc;
        doc.at('rules').push('new prop');
        console.log(doc.snapshot);
        this.forceUpdate();
    }

    render () {
        var o;
        try {
            o = this.state.doc.at('rules').get();
        } catch (e) {
            o = undefined;
        }
        if (o === undefined) {
            o = [];
            this.state.doc.set({ rules: o });
        }
        return (<div>
            {o.map((x, i) => <div key={i}>{x}</div>)}
            <div><button onClick={this.add.bind(this)}>Add</button></div>
        </div>);
    }

}

module.exports = VisualEditor;
