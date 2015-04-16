var Stapes = require('stapes');
var React = require('react');

var ToolButton = React.createClass({
    render: function () {
        if (this.props.open) {
            var menu = this.props.menu.map(function (item) {
                return (<li key={'menu_'+item.title} onClick={item.click}>{item.title}</li>);
            });
            return (<a><span onClick={this.props.click}>{this.props.title}</span>
                    <ul>{menu}</ul>
            </a>);
        } else {
            return (<a onClick={this.props.click}>{this.props.title}</a>);
        }
    }
});

var ToolBar = React.createClass({
    getInitialState: function () {
        this.props.tools.on('change', function() {
            this.setState(this.state);
        }, this);
        return {};
    },
    open: function (value) {
        var This = this;
        document.onclick = function (e) {
            This.setState({open: ''});
            document.onclick = null;
            e.stopPropagation();
            e.preventDefault();
        };
        this.setState({open: value});
    },
    render: function () {
        var map_to_node = function(item) {
            var key = 'toolbutton_'+item.title;
            if (item.node) {
                return item.node;
            } else if (item.click) {
                return <ToolButton key={key} click={item.click} title={item.title} />;
            } else {
                return <ToolButton key={key} click={this.open.bind(this, key)} title={item.title}
                    open={this.state.open==key} menu={item.menu} />;
            }
        };
        return (
            <nav>
                <a id="Home" href="index.html">Home</a>
                {this.props.tools.filter(x => !x.right).map(map_to_node, this)}
                <span className="spacer"></span>
                {this.props.tools.filter(x => x.right).map(map_to_node, this)}
            </nav>
        );
    },
});

var ToolList = Stapes.subclass({
    constructor: function (mount) {
        React.render(<ToolBar tools={this} />, mount);
    }
});

module.exports = ToolList;
