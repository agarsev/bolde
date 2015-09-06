"use strict";

var React = require('react');

require('styles/row');

class RowMenu extends React.Component {

    constructor (props) {
        super(props);
        this.state = { show: false, off: this.off.bind(this) };
    }

    on (e) {
        document.addEventListener("click", this.state.off);
        this.setState({ show: true });
        e.stopPropagation();
    }

    off (e) {
        document.removeEventListener("click", this.state.off);
        this.setState({ show: false });
        e.stopPropagation();
    }

    render () {
        var as = this.props.actions;
        var titleStyle = {
            position: 'relative'
        };
        var dropStyle = {
            position: 'absolute',
            left: 0,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
        };
        return <a style={titleStyle} onClick={this.state.show?this.off.bind(this):this.on.bind(this)}>
            {this.props.title}
            {this.state.show?<div style={dropStyle}>
                {Object.keys(as).map(ax => <a key={ax} onClick={as[ax]}>{ax}</a>)}
            </div>:null}
        </a>;
    }

}

class Row extends React.Component {

    constructor (props) {
        super(props);
        var is = props.initShown;
        this.state = { shown: is!==undefined?is:true };
    }

    toggle () {
        this.setState({ shown: !this.state.shown });
    }

    render () {
        var as = this.props.actions || {};
        var col = this.props.collapsable;
        return <div className="row">
            <div className={"row_header"+(col?" collapsable":'')}
                onClick={col?this.toggle.bind(this):null}>
                <span key="sp1" className="spacer" />
                <span key="title" >{this.props.title}</span>
                <span key="sp2" className="spacer" />
                {Object.keys(as).map(ax => typeof as[ax] == 'object'
                    ?<RowMenu key={ax} title={ax} actions={as[ax]} />
                    :<a key={ax} onClick={as[ax]}>{ax}</a>
                 )}
            </div>
            {this.state.shown?
                <div className="row_body">
                {this.props.children}
                </div>
                :null}
        </div>;
    }
}

module.exports = Row;
