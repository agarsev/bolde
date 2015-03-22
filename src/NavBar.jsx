var React = require('react');

var NavButton = React.createClass({
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

var NavBar = React.createClass({
    getInitialState: function () {
        var global = this.props.global;
        global.on('change:project', function(project) {
            this.setState({ project: project });
        }, this);
        global.on('change:user', function(user) {
            this.setState({ logged: user!=undefined });
        }, this);
        global.tools.on('change', function() {
            this.setState(this.state);
        }, this);
        return { logged: this.props.global.user != undefined,
            project: this.props.global.project, open: '' };
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
        var tools = this.props.global.tools.map(function(item) {
            var key = 'toolbutton_'+item.title;
            return <NavButton key={key} click={this.open.bind(this, key)} title={item.title}
                open={this.state.open==key} menu={item.menu} />;
        }, this);
        var login;
        if (this.state.logged) {
            login = <a>Logout</a>;
        } else {
            login = <form ref="login" action="#" onSubmit={this.submitLogin}>
                        <input ref="user" placeholder="username" name="user" type="text" />
                        <input ref="password" placeholder="password" name="password" type="password" />
                        <button formAction="submit">Login</button>
                    </form>;
        }
        return (
            <nav>
                <a id="Home" href="index.html">Home</a>
                {tools}
                <span className="spacer"></span>
                {login}
            </nav>
        );
    },
    submitLogin: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var user = this.refs.user.getDOMNode().value;
        var pass = this.refs.password.getDOMNode().value;
        this.props.global.login(user, pass);
    }
});

module.exports = NavBar;
