var React = require('react');
var LoginForm = require('./LoginForm');
var Actions = require('./Actions');

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
        return {open: ''};
    },
    componentDidMount: function () {
        window.ToolStore.on('changed', this.forceUpdate, this);
        window.UserStore.on('changed', this.forceUpdate, this);
    },
    open: function (value) {
        document.onclick = e => {
            this.setState({open: ''});
            document.onclick = null;
            e.stopPropagation();
            e.preventDefault();
        };
        this.setState({open: value});
    },
    render: function () {
        var map_to_node = item => {
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
        var log;
        if (window.UserStore.isLogged()) {
            log = <ToolButton title="Logout" click={() => Actions.logout()} />;
        } else {
            log = <LoginForm />;
        }
        return (
            <nav>
                <a id="Home" href="index.html">Home</a>
                {window.ToolStore.getTools(false).map(map_to_node)}
                <span className="spacer"></span>
                {window.ToolStore.getTools(true).map(map_to_node)}
                {log}
            </nav>
        );
    },
});

module.exports = ToolBar;
