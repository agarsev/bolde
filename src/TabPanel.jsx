// expects:
// views: array with: id(title) node(reactnode)
var TabPanel = React.createClass({
    getInitialState: function () {
        return {
            tabs: [ [], this.props.views.map(function(x,i){return i;}), [] ],
            selected: [ undefined, 0, undefined ]
        }
    },
    focus: function (id) {
        var sel = this.state.selected;
        for (var i=0; i<this.state.tabs.length; i++) {
            var t = this.state.tabs[i];
            for (var j=0; j<t.length; j++) {
                if (this.props.views[t[j]].id==id) {
                    sel[i] = j;
                    break;
                }
            }
            if (j<t.length) { break; }
        }
        this.setState({selected: sel});
    },
    tabMouseDown: function (panel, tab) {
        var centralrect = this.refs.central.getDOMNode().getBoundingClientRect();
        var fallback_sel = this.state.tabs.map(function (x) {
            if (tab == x[0]) { return x[1]; }
            return x[0];
        });
        var selected = this.state.selected;
        var tabs = this.state.tabs;
        selected[panel]=tab;
        this.setState({tabs:tabs,selected:selected});
        document.onmousemove = function(e) {
            var newpanel;
            if (e.clientX<centralrect.left) {
                newpanel = 0;
            } else if (e.clientX>centralrect.right) {
                newpanel = 2;
            } else {
                newpanel = 1;
            }
            if (newpanel!=panel) {
                tabs = tabs.map(function(x){
                    return x.filter(function (y) {
                        return y!=tab;
                    });
                });
                tabs[newpanel].push(tab);
                selected[panel]=fallback_sel[panel];
            }
            selected[newpanel]=tab;
            this.setState({tabs:tabs,selected:selected});
            e.preventDefault();
            panel = newpanel;
        }.bind(this);
        document.onmouseup = function(e) {
            this.setState({tabs:tabs,selected:selected});
            document.onmousemove = null;
            document.onmouseup = null;
            e.preventDefault();
        }.bind(this);
    },
    refDOM: function (name) {
        return this.refs[name].getDOMNode();
    },
    render: function () {
        var navs = this.state.tabs.map(function (tabs, i) {
            if (tabs.length==0) { return undefined; }
            return (
                    <nav>
                    {tabs.map(function(x) {
                        return (<a className={x==this.state.selected[i]?'selected':''}
                                onMouseDown={this.tabMouseDown.bind(this,i,x)}
                                key={'nav'+x}>{this.props.views[x].id}</a>);
                    }, this)}
                    <span className="spacer"></span>
                    </nav>
            );
        }, this);
        var conts = this.state.tabs.map(function(tabs, i) {
            if (tabs.length==0) { return undefined; }
            return tabs.map(function(x) {
                return (<div key={'cont'+x}
                    style={{display:(x==this.state.selected[i]?'':'none')}}
                    >{this.props.views[x].node}</div>);
            }, this);
        }, this);
        return (
            <main>
                <section ref="left">
                    {navs[0]}
                    {conts[0]}
                </section>
                <Gutter dir="right" getTarget={this.refDOM.bind(this, 'left')} />
                <section ref="central" style={{flex:"1"}} >
                    {navs[1]}
                    {conts[1]}
                </section>
                <Gutter dir="left" getTarget={this.refDOM.bind(this, 'right')} />
                <section ref="right">
                    {navs[2]}
                    {conts[2]}
                </section>
            </main>
        );
    }
});
