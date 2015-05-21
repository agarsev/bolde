"use strict";

var React = require('react');
var types = require('borjes/src/types');
var fmt = require('borjes/src/formatter');

var branch= '<svg xmlns="http://www.w3.org/2000/svg"'
           +' xmlns:xlink="http://www.w3.org/1999/xlink"'
           +' width="100%" height="0.6em"'
           +' preserveAspectRatio="none"'
           +' viewBox="0 0 100 100">';
var straightC = branch
           +'  <line x1="50" y1="100" x2="50" y2="0" style="stroke:#000000;" vector-effect="non-scaling-stroke"/>'
           +'</svg>';
var leftC = branch
           +'  <line x1="50" y1="100" x2="100" y2="0" style="stroke:#000000;" vector-effect="non-scaling-stroke"/>'
           +'</svg>';
var rightC = branch
           +'  <line x1="50" y1="100" x2="0" y2="0" style="stroke:#000000;" vector-effect="non-scaling-stroke"/>'
           +'</svg>';
var leftN = branch
           +'  <line x1="0" y1="100" x2="100" y2="0" style="stroke:#000000;" vector-effect="non-scaling-stroke"/>'
           +'</svg>';
var rightN = branch
           +'  <line x1="100" y1="100" x2="0" y2="0" style="stroke:#000000;" vector-effect="non-scaling-stroke"/>'
           +'</svg>';

class BorjesTree extends React.Component {

    render () {
        var o = this.props.tree;
        if (o.length) {
            return (<div>
                {o.map((t, i) => <BorjesTree key={i} tree={t} />)}
            </div>);
        }
        var text = fmt.flist(o.node, 'symbol');

        var oneStyle = {
            textAlign: "center"
        };
        var tableStyle = {
            textAlign: "center",
            borderCollapse: "collapse"
        };
        var textStyle = {
            padding: "0 2ex"
        };
        var centeredTextStyle = {
            padding: "0 2ex",
            display: 'inline-block',
            transform: 'translate(-50%, 0)'
        };
        if (o.children.length<2) {
            var branch;
            switch (this.props.branch) {
                case 'straight': branch=straightC; break;
                case 'left': branch=leftC; break;
                case 'right': branch=rightC; break;
            }
            return (<span style={oneStyle}>
                {branch?<div dangerouslySetInnerHTML={{__html:branch}} />:null}
                <div style={textStyle}>{text}</div>
                {o.children.length==0?null:<BorjesTree branch="straight" tree={o.children[0]} />}
            </span>);
        } else if (o.children.length == 2) {
            var branch;
            switch (this.props.branch) {
                case 'straight': branch=<tr><td colSpan="2" dangerouslySetInnerHTML={{__html:straightC}}/></tr>; break;
                case 'left': branch=<tr><td /><td dangerouslySetInnerHTML={{__html:leftN}}/></tr>; break;
                case 'right': branch=<tr><td dangerouslySetInnerHTML={{__html:rightN}}/><td /></tr>; break;
            }
            return (<table style={tableStyle}>
                    {branch}
                    <tr><td></td><td style={{textAlign: 'left'}}>
                        <span style={centeredTextStyle}>{text}</span>
                    </td></tr>
                    <tr><td style={{verticalAlign: 'top'}}>
                        <BorjesTree branch="left" tree={o.children[0]} />
                    </td><td style={{verticalAlign: 'top'}}>
                        <BorjesTree branch="right" tree={o.children[1]} />
                    </td></tr>
            </table>);
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.tree !== this.props.tree;
    }

};

module.exports = BorjesTree;
