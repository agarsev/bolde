"use strict";

var React = require('react');

var Actions = require('../Actions');

class LoginForm extends React.Component {

    render () {
        var register = this.props.action == 'register';
        return (<form action="#" onSubmit={this.submitLogin.bind(this)}>
                    <input ref={d => this.username=d} placeholder="username" name="user" type="text" />
                    <input ref={d => this.password=d} placeholder="password" name="password" type="password" />
                    <button formAction="submit">{register?"Register":"Login"}</button>
                </form>);
    }

    submitLogin (e) {
        e.preventDefault();
        e.stopPropagation();
        var user = this.username.value;
        var pass = this.password.value;
        if (this.props.action == 'register') {
            Actions.user.register(user, pass);
        } else {
            Actions.user.login(user, pass);
        }
    }

};

module.exports = LoginForm;
