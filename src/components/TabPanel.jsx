"use strict";

var React = require('react');
var Gutter = require('./Gutter');
var Actions = require('../Actions');

class TabPanel extends React.Component {

    componentDidMount () {
        window.TabStore.on('changed', this.forceUpdate.bind(this));
        window.UserStore.on('changed', this.forceUpdate.bind(this));
    }

    tabMouseDown (id) {
        var centralrect = this.central.getBoundingClientRect();
        document.onmousemove = function(e) {
            if (e.clientX<centralrect.left) {
                Actions.tab.move_to_panel(id, 0);
            } else if (e.clientX>centralrect.right) {
                Actions.tab.move_to_panel(id, 2);
            } else {
                Actions.tab.move_to_panel(id, 1);
            }
            e.preventDefault();
        };
        document.onmouseup = function(e) {
            Actions.tab.focus(id);
            document.onmousemove = null;
            document.onmouseup = null;
            e.preventDefault();
        };
    }

    closeTab (tab, e) {
        document.onmouseup = function(e) {
            var sc = window.TabStore.getShouldClose(tab);
            if (sc === undefined || sc()) {
                Actions.tab.close(tab);
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
    }

    render () {
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
                <section ref={d=>this.left=d}>
                    {navs[0]}
                    {conts[0]}
                </section>
                <Gutter dir="right" getTarget={() => this.left} />
                <section ref={d=>this.central=d} style={{flex:"1"}} >
                    {navs[1]}
                    {conts[1]}
                </section>
                <Gutter dir="left" getTarget={() => this.right} />
                <section ref={d=>this.right=d}>
                    {navs[2]}
                    {conts[2]}
                </section>
            </main>
        );
    }

};

module.exports = TabPanel;
