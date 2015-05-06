"use strict";

var React = require('react');

class LogView extends React.Component {

    componentDidMount () {
        window.LogStore.on('changed', this.forceUpdate.bind(this));
    }

    render () {
        var logs = window.LogStore.getAll(this.props.filter);
        return (<div>{logs.map((l, i) =>
            <div key={i}>{l}</div>
        )}</div>);
    }

}

module.exports = LogView;
