"use strict";

var React = require('react');
var Borjes = require('borjes-react');

require('styles/tree');

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
        return (<div style={{display: 'flex', flexDirection: 'column' }}>
            {this.props.list===undefined?(<div style={{flex: 0}}>
                Query: <input ref="querytext" type="text" />
                <button onClick={this.runQuery.bind(this)}>Run</button>
            </div>):null}
            {this.state.error!==null?<div style={{flex: 0, color: 'red'}}>{this.state.error}</div>:null}
            <div style={{flex: 1, overflowY: 'auto' }}>
                {this.state.view.map((o, i) => <div className="tree_row" key={i}>
                                     <div className="tree_header" onClick={this.toggleRow.bind(this, i)}>Result {i}</div>
                                     {this.state.open[i]?<div className="tree_item"><Borjes tree={o} /></div>:null}
                                    </div>)}
            </div>
        </div>);
    }

}

module.exports = TBView;
