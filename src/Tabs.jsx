var Tabs = React.createClass({
    getInitialState: function () {
        return { selected: 0, tabs: this.props.initTabs };
    },
    tabClick: function (number) {
        return function (e) {
            this.setState({selected: number});
        }.bind(this);
    },
    render: function () {
        if (this.state.tabs.length==0) {
            return <span></span>;
        }
        if (this.state.tabs.length==1) {
            return (
                <div className="tabs">
                <div>{this.state.tabs[0].node}</div>
                </div>
            );
        }
        var navlinks = [];
        var cont = [];
        for (var i = 0; i<this.state.tabs.length; i++) {
            var t = this.state.tabs[i];
            if (i == this.state.selected) {
                navlinks.push(<a className="selected" key={t.title}>{t.title}</a>);
                cont.push(<div key={i} ref={i} style={{display: 'block'}}>{t.node}</div>);
            } else {
                navlinks.push(<a onClick={this.tabClick(i)} key={t.title}>{t.title}</a>);
                cont.push(<div key={i} ref={i} style={{display: 'none'}}>{t.node}</div>);
            }
        }
        return (
            <div className="tabs">
                <nav>
                    {navlinks}
                    <span className="spacer"></span>
                </nav>
                <div>
                    {cont}
                </div>
            </div>
        );
    },
});
