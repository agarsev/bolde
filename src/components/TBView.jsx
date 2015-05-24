"use strict";

var React = require('react');
var BorjesTree = require('./BorjesTree');

class TBView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { view: [], error: null };
    }

    runQuery () {
        try {
            var query = React.findDOMNode(this.refs.querytext).value;
            window.TreebankStore.query(this.props.treebank, query)
            .then((result) => this.setState({ view: result, error: null }) )
            .catch((err) => this.setState({ error: err }) );
        } catch (e) {
            this.setState({ error: e.message });
        }
    }

    render () {
        return (<div style={{display: 'flex', flexDirection: 'column' }}>
            <div style={{flex: 0}}>Query: <input ref="querytext" type="text" />
            <button onClick={this.runQuery.bind(this)}>Run</button></div>
            {this.state.error!==null?<div style={{flex: 0, color: 'red'}}>{this.state.error}</div>:null}
            <div style={{flex: 1, overflowY: 'auto' }}>
                {this.state.view.map((o, i) => <BorjesTree key={i} tree={o} />)}
            </div>
        </div>);
    }

}

module.exports = TBView;
