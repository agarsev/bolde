var React = require('react');

var AVM = React.createClass({
    getInitialState: function () {
        var show = true;
        if (this.isVariable()) { show = false; }
        return { show };
    },
    toggle: function () {
        this.setState({ show: !this.state.show });
    },
    isVariable: function () {
        return (typeof this.props.data === 'string' && /^[A-Z]/.test(this.props.data));
    },
    render: function () {
        var o = this.props.data;
        var bindings = this.props.bindings || o._bindings;
        if (this.isVariable()) {
            return (<span>
                <a className="borjs_var" onClick={this.toggle} >{o}</a>
                {this.state.show?<AVM data={bindings.get(o)} bindings={bindings} />:null}
            </span>);
        } else if (typeof o === 'string') { // literal
            return <span className="borjs_literal">{o}</span>
        } else if (!!o.l) { // list
            var first = true;
            var els = [];
            for (var i=0;i<o.l.length;i++) {
                if (first) { first = false; }
                else { els.push(<span key={'comma_'+i}>, </span>); }
                els.push(<AVM key={'list_'+i} data={o.l[i]} bindings={bindings} />);
            }
            return (<span className="borjs_list">&lt;{els}&gt;</span>);
        } else if (typeof o === 'object') {
            var atrs = Object.keys(o).filter(x => !(/^_/.test(x)));
            if (atrs.length<1) {
                return (<AVM data={o._type} bindings={bindings}/>);
            }
            return (<table className="borjs_tfs">
                <thead><tr><th colSpan="2" onClick={this.toggle}>
                {o._type}
                </th></tr></thead>
                <tbody>
                {this.state.show?atrs.map(x => {
                    return (<tr key={x}>
                        <td className="borjs_feat">{x}</td>
                        <td><AVM data={o[x]} bindings={bindings}/></td>
                    </tr>);
                }):null}
                </tbody>
            </table>);
        } else {
            return (<span className="borjs_unknown">{o.toSource()}</span>);
        }
    },
});

module.exports = AVM;
