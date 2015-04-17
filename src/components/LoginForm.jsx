var React = require('react');

var Actions = require('./Actions');

var LoginForm = React.createClass({
    render: function() {
        return (<form action="#" onSubmit={this.submitLogin}>
                    <input ref="user" placeholder="username" name="user" type="text" />
                    <input ref="password" placeholder="password" name="password" type="password" />
                    <button formAction="submit">Login</button>
                </form>);
    },
    submitLogin: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var user = this.refs.user.getDOMNode().value;
        var pass = this.refs.password.getDOMNode().value;
        Actions.login(user, pass);
    }
});

module.exports = LoginForm;
