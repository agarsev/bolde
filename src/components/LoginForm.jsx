"use strict";

var React = require('react');

var Actions = require('../Actions');

class LoginForm extends React.Component {

    render () {
        var register = this.props.action == 'register';
        return (<form action="#" onSubmit={this.submitLogin.bind(this)}>
                    <input ref="user" placeholder="username" name="user" type="text" />
                    <input ref="password" placeholder="password" name="password" type="password" />
                    <button formAction="submit">{register?"Register":"Login"}</button>
                </form>);
    }

    submitLogin (e) {
        e.preventDefault();
        e.stopPropagation();
        var user = React.findDOMNode(this.refs.user).value;
        var pass = React.findDOMNode(this.refs.password).value;
        if (this.props.action == 'register') {
            Actions.user.register(user, pass);
        } else {
            Actions.user.login(user, pass);
        }
    }

};

module.exports = LoginForm;
