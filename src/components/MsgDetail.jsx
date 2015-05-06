"use strict";

var React = require('react');
var BorjesTree = require('./BorjesTree');
var Actions = require('../Actions');

class MsgDetail extends React.Component {

    render () {
        var aStyle = {
            cursor: 'pointer',
            textDecoration: 'underline',
            color: 'blue',
            marginLeft: '1em',
            textStyle: 'italics'
        };
        var detail = this.props.detail;
        var name = this.props.name;
        var title = name.substr(name.search(/\/[^\/]+$/)+1);
        return (<div>
            {this.props.msg}
            {detail?<a style={aStyle} onClick={function() {
                Actions.tab.open('detail_'+name, title, <BorjesTree tree={detail} />);
            }}>show more</a>:null}
        </div>);
    }
}

module.exports = MsgDetail;
