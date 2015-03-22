var React = require('react');

var NavBar = React.createClass({
    getInitialState: function () {
        this.props.global.on('change:project', function(project) {
            this.setState({ project: project });
        }, this);
        this.props.global.on('change:user', function(user) {
            this.setState({ logged: user!=undefined });
        }, this);
        return { logged: this.props.global.user != undefined,
            project: this.props.global.project };
    },
    render: function () {
        var projectbuttons;
        if (this.state.project) {
            projectbuttons = <a>Project</a>;
        }
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
                {projectbuttons}
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
