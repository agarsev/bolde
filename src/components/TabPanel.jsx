var React = require('react');
var Gutter = require('./Gutter');
var Actions = require('./Actions');

var TabPanel = React.createClass({
    componentDidMount: function () {
        window.TabStore.on('changed', this.forceUpdate.bind(this));
        window.UserStore.on('changed', this.forceUpdate.bind(this));
    },
    tabMouseDown: function (id) {
        var centralrect = this.refs.central.getDOMNode().getBoundingClientRect();
        document.onmousemove = function(e) {
            if (e.clientX<centralrect.left) {
                Actions.move_tab_panel(id, 0);
            } else if (e.clientX>centralrect.right) {
                Actions.move_tab_panel(id, 2);
            } else {
                Actions.move_tab_panel(id, 1);
            }
            e.preventDefault();
        };
        document.onmouseup = function(e) {
            Actions.focus_tab(id);
            document.onmousemove = null;
            document.onmouseup = null;
            e.preventDefault();
        };
    },
    closeTab: function (tab, e) {
        document.onmouseup = function(e) {
            var sc = window.TabStore.getShouldClose(tab);
            if (sc === undefined || sc()) {
                Actions.close_tab(tab);
            }
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
        var navs = [0, 1, 2].map(panel => {
            var tabs = window.TabStore.getTabs(panel);
            if (tabs.length==0) { return undefined; }
            return (
                <nav>
                    {tabs.map(tab =>
                        (<a className={tab.selected?'selected':''}
                            onMouseDown={this.tabMouseDown.bind(this,tab.id)}
                            key={'nav'+tab.id} >
                            <span>{tab.title}</span>
                            <span className="close" onMouseDown={this.closeTab.bind(this,tab.id)} />
                        </a>))
                    }
                    <span className="spacer"></span>
                </nav>
            );
        });
        var conts = [0, 1, 2].map(panel => {
            var tabs = window.TabStore.getTabs(panel);
            if (tabs.length==0) { return undefined; }
            return tabs.map(tab =>
                (<div key={'cont'+tab.id}
                    style={{display:(tab.selected?'':'none')}} >
                    {tab.node}
                </div>)
            );
        });
        return (
            <main>
                <section ref="left">
                    {navs[0]}
                    {conts[0]}
                </section>
                <Gutter dir="right" getTarget={() => this.refs['left'].getDOMNode()} />
                <section ref="central" style={{flex:"1"}} >
                    {navs[1]}
                    {conts[1]}
                </section>
                <Gutter dir="left" getTarget={() => this.refs['right'].getDOMNode()} />
                <section ref="right">
                    {navs[2]}
                    {conts[2]}
                </section>
            </main>
        );
    }
});

module.exports = TabPanel;
