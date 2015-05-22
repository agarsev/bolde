"use strict";

var React = require('react');
var BorjesTree = require('./BorjesTree');

class TBView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { view: [] };
    }

    runQuery () {
        var query = JSON.parse(React.findDOMNode(this.refs.querytext).value);
        window.TreebankStore.query(this.props.treebank, query)
        .then((result) => this.setState({ view: result }) )
        .catch((err) => console.log(err) );
    }

    render () {
        return (<div style={{display: 'flex', flexDirection: 'column' }}>
            <div style={{flex: 0}}>Query: <input ref="querytext" type="text" />
            <button onClick={this.runQuery.bind(this)}>Run</button></div>
            <div style={{flex: 1, overflowY: 'auto' }}>
                {this.state.view.map((o, i) => <BorjesTree key={i} tree={o} />)}
            </div>
        </div>);
    }

}

module.exports = TBView;
