"use strict";

var React = require('react');
var Actions = require('../Actions');
var Form = require('./TForm');

class Prompt extends React.Component {

    dismiss (e) {
        this.props.reject();
        Actions.clearPrompt();
        e.stopPropagation();
    }

    componentDidMount () {
        if (this._form !== undefined) {
            this._form.focus();
        }
    }

    accept (e) {
        var v = this._form !== undefined ?
            this._form.getValue() : true;
        if (v === null) {
            this.props.reject();
        } else {
            this.props.resolve(v);
        }
        Actions.clearPrompt();
        e.stopPropagation();
    }

    render () {
        var overlayStyle = {
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 100
        };
        var promptStyle = {
            padding: '2em',
            flex: '0 0 auto',
            borderRadius: 5,
            border: '1px solid black',
            background: 'white',
            zIndex: 101
        };
        return (<div style={overlayStyle} onClick={this.dismiss.bind(this)}>
            <div style={promptStyle} onClick={e => e.stopPropagation()}>
                {this.props.msg?<div>{this.props.msg}</div>:null}
                {this.props.form?<Form ref={d=>this._form=d} getData={() => this.props.form} />:null}
                <button onClick={this.accept.bind(this)}>OK</button>
                <button onClick={this.dismiss.bind(this)}>Cancel</button>
            </div>
        </div>);
    }

};

module.exports = Prompt;
