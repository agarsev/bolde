var default_panel = {
    'DirTree': 0,
};

// expects:
// views: global views object, each with id, title and node
var TabPanel = React.createClass({
    getInitialState: function () {
        this.props.views.on("create", this.viewCreated, this);
        this.props.views.on("remove", this.viewDeleted, this);
        var panels = [0, 1, 2].map(function (t) {
            return this.props.views.filter(function(x){
                return (default_panel[x.node.type.displayName]==t) ||
                    (t==1 && default_panel[x.node.type.displayName]==undefined);
            }).map(x => x.id);
        }, this);
        return {
            // an array of panels, each one an array of view's titles (ordering)
            tabs: panels,
            // an array of panels, each one with the index of the selected tab
            selected: [0,1,2].map(t => panels[t].length-1)
        }
    },
    viewCreated: function (key) {
        tabs = this.state.tabs;
        selected = this.state.selected;
        var panel = default_panel[this.props.views.get(key).node.type.displayName];
        if (panel === undefined) { panel = 1; }
        tabs[panel].push(key);
        selected[panel] = tabs[panel].length-1;
        this.setState({tabs: tabs, selected: selected});
    },
    viewDeleted: function (key) {
        var which_panel, which_tab;
        tabs = this.state.tabs.map(function(x, i){
            var ret = [];
            for (var j = 0; j<x.length; j++) {
                var y = x[j];
                if (x[j]==key) {
                    which_panel=i;
                    which_tab=j;
                } else {
                    ret.push(x[j]);
                }
            }
            return ret;
        });
        selected = this.state.selected;
        if (selected[which_panel]==tabs[which_panel].length ||
            which_tab < selected[which_panel]) {
            selected[which_panel]--;
        }
        this.setState({tabs: tabs, selected: selected});
    },
    focus: function (id) {
        var sel = this.state.selected;
        var found = false;
        for (var i=0; !found && i<this.state.tabs.length; i++) {
            var t = this.state.tabs[i];
            for (var j=0; !found && j<t.length; j++) {
                if (t[j]==id) {
                    sel[i] = j;
                    found = true;
                }
            }
        }
        this.setState({selected: sel});
    },
    tabMouseDown: function (panel, tab, id) {
        var centralrect = this.refs.central.getDOMNode().getBoundingClientRect();
        var selected = this.state.selected;
        var tabs = this.state.tabs;
        selected[panel]=tab;
        this.setState({selected:selected});
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
                        return y!=id;
                    });
                });
                tabs[newpanel].push(id);
                selected[newpanel] = tabs[newpanel].length-1;
                if (selected[panel]==tabs[panel].length){
                    selected[panel]--;
                }
                this.setState({tabs:tabs,selected:selected});
                panel = newpanel;
            }
            e.preventDefault();
        }.bind(this);
        document.onmouseup = function(e) {
            document.onmousemove = null;
            document.onmouseup = null;
            e.preventDefault();
        }.bind(this);
    },
    closeTab: function (tab, e) {
        document.onmouseup = function(e) {
            this.props.views.close(tab);
            document.onmousemove = null;
            document.onmouseup = null;
        }.bind(this);
        e.target.onmouseout = function(e) {
            document.onmousemove = null;
            document.onmouseup = null;
        }
        e.preventDefault();
        e.stopPropagation();
    },
    refDOM: function (name) {
        return this.refs[name].getDOMNode();
    },
    render: function () {
        var navs = this.state.tabs.map(function (tabs, i) {
            if (tabs.length==0) { return undefined; }
            return (
                    <nav>
                    {tabs.map(function(x, j) {
                        return (<a className={j==this.state.selected[i]?'selected':''}
                                onMouseDown={this.tabMouseDown.bind(this,i,j,x)}
                                key={'nav'+x}>
                                <span>{this.props.views.get(x).title}</span>
                                <span className="close" onMouseDown={this.closeTab.bind(this,x)} />
                                </a>);
                    }, this)}
                    <span className="spacer"></span>
                    </nav>
            );
        }, this);
        var conts = this.state.tabs.map(function(tabs, i) {
            if (tabs.length==0) { return undefined; }
            return tabs.map(function(x, j) {
                return (<div key={'cont'+x}
                    style={{display:(j==this.state.selected[i]?'':'none')}}
                    >{this.props.views.get(x).node}</div>);
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
