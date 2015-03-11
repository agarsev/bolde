var Tabs = React.createClass({
    tabClick: function (which) {
        this.props.handler(which);
    },
    render: function () {
        if (!this.props.children || this.props.children.length==0) {
            return(<section style={this.props.style} />);
        }
        var navlinks = React.Children.map(this.props.children,function(child) {
            return (<a className={child.props.title==this.props.selected?"selected":""}
                    onMouseDown={this.tabClick.bind(this,child.props.title)}
                    key={child.props.title}>{child.props.title}</a>);
        }, this);
        var cont = React.Children.map(this.props.children,function(child) {
            return (<div style={{display:(child.props.title==this.props.selected?"":"none")}}
                    >{child}</div>);
        }, this);
        return (
            <section style={this.props.style} >
                <nav>
                    {navlinks}
                    <span className="spacer"></span>
                </nav>
                {cont}
            </section>
        );
    },
});
