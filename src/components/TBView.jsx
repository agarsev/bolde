"use strict";

var React = require('react');
var BorjesTree = require('./BorjesTree');

class TBView extends React.Component {

    constructor(props) {
        super(props);
        if (this.props.list) {
            this.state = { view: this.props.list, error: null, open: {} };
        } else {
            this.state = { view: [], error: null, open: {} };
        }
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

    shouldComponentUpdate(props) {
        if (props.list) {
            this.state.view = props.list;
        }
        return true;
    }

    toggleRow (i) {
        var open = this.state.open;
        open[i] = !open[i];
        this.setState({open: open});
    }

    render () {
        var rowStyle = {
            border: "1px solid #666",
            margin: "0.5ex",
            marginRight: "1.5em"
        };
        var headerStyle = {
            background: "#ccd",
            padding: "0.5ex",
            textAlign: "center",
            cursor: "pointer",
        };
        var resultStyle = {
            padding: "0.5ex",
            overflow: 'auto'
        };
        return (<div style={{display: 'flex', flexDirection: 'column' }}>
            {this.props.list===undefined?(<div style={{flex: 0}}>
                Query: <input ref="querytext" type="text" />
                <button onClick={this.runQuery.bind(this)}>Run</button>
            </div>):null}
            {this.state.error!==null?<div style={{flex: 0, color: 'red'}}>{this.state.error}</div>:null}
            <div style={{flex: 1, overflowY: 'auto' }}>
                {this.state.view.map((o, i) => <div style={rowStyle} key={i}>
                                     <div style={headerStyle} onClick={this.toggleRow.bind(this, i)}>Result {i}</div>
                                     {this.state.open[i]?<div style={resultStyle}><BorjesTree tree={o} /></div>:null}
                                    </div>)}
            </div>
        </div>);
    }

}

module.exports = TBView;
