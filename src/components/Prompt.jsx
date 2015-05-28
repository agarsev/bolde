"use strict";

var React = require('react');
var Actions = require('../Actions');
var Form = require('./TForm');

class Prompt extends React.Component {

    dismiss () {
        this.props.reject();
        Actions.clearPrompt();
    }

    accept () {
        var v = this.refs.form.getValue();
        if (v == null) {
            this.props.reject();
        } else {
            this.props.resolve(v);
        }
        Actions.clearPrompt();
    }

    render () {
        var overlayStyle = {
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around'
        };
        var promptStyle = {
            padding: '2em',
            flex: '0 0 auto',
            borderRadius: 5,
            border: '1px solid black',
            background: 'white'
        };
        return (<div style={overlayStyle} onClick={this.dismiss.bind(this)}>
            <div style={promptStyle} onClick={e => e.stopPropagation()}>
                <Form ref="form" getData={() => this.props.form} />
                <button onClick={this.accept.bind(this)}>OK</button>
                <button onClick={this.dismiss.bind(this)}>Cancel</button>
            </div>
        </div>);
    }

};

module.exports = Prompt;
