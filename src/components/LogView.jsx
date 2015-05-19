"use strict";

var React = require('react');

class LogView extends React.Component {

    componentDidMount () {
        window.LogStore.on('changed', this.forceUpdate.bind(this));
    }

    render () {
        var logs = window.LogStore.getAll(this.props.filter);
        var styles = {
            DEBUG: {
                color: '#99e0f0'
            },
            INFO: {
                color: 'green'
            },
            ERROR: {
                color: 'red',
                fontWeight: 'bold'
            }
        };
        return (<div>{logs.map((l, i) =>
            <div style={styles[l.level]} key={i}>{"["+l.level+"]: "+l.message}</div>
        )}</div>);
    }

}

module.exports = LogView;
