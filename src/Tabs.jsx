var Tabs = React.createClass({
    getInitialState: function () {
        if (React.Children.count(this.props.children)>1) {
            return { selected: this.props.children[0].props.title };
        } else if (React.Children.count(this.props.children)>0) {
            return { selected: this.props.children.props.title };
        } else {
            return { selected: null };
        }
    },
    tabClick: function (which) {
        return function (e) {
            this.setState({selected: which});
        }.bind(this);
    },
    render: function () {
        if (React.Children.count(this.props.children)<1) {
            return(<section style={this.props.style} />);
        }
        if (React.Children.count(this.props.children)==1) {
            return (
                <section style={this.props.style}>
                <div>{React.Children.only(this.props.children)}</div>
                </section>
            );
        }
        var navlinks = React.Children.map(this.props.children,function(child) {
            return (<a className={child.props.title==this.state.selected?"selected":""}
                    onClick={this.tabClick(child.props.title)}
                    key={child.props.title}>{child.props.title}</a>);
        }, this);
        var cont = React.Children.map(this.props.children,function(child) {
            return (<div style={{display:(child.props.title==this.state.selected?"":"none")}}
                    >{child}</div>);
        }, this);
        return (
            <section style={this.props.style} >
                <nav>
                    {navlinks}
                    <span className="spacer"></span>
                </nav>
                <div>
                    {cont}
                </div>
            </section>
        );
    },
});
