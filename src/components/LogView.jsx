"use strict";

var React = require('react');

var Actions = require('../Actions');

class LogView extends React.Component {

    constructor (props) {
        super(props);
        window.LogStore.on('changed', this.forceUpdate.bind(this));
    }

    componentDidUpdate () {
        var lw = React.findDOMNode(this.refs.logwindow);
        lw.scrollTop = lw.scrollHeight;
    }

    clear () {
        Actions.clearLogs(this.props.filter);
    }

    render () {
        var logs = window.LogStore.getAll(this.props.filter);
        var container = {
            height: '100%',
            overflowY: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        };
        var messages = {
            flex: '1',
            overflowY: 'auto'
        };
        var styles = {
            DEBUG: {
                color: '#99A1CD'
            },
            INFO: {
                color: 'green'
            },
            ERROR: {
                color: 'red',
                fontWeight: 'bold'
            }
        };
        return (<div style={container}><button onClick={this.clear.bind(this)}>Clear</button>
            <div ref="logwindow" style={messages}>{logs.map((l, i) =>
                <div style={styles[l.level]} key={i}>{"["+l.level+"]: "+l.message}</div>
            )}</div>
        </div>);
    }

}

module.exports = LogView;
