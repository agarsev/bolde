var React = require('react');
var Stapes = require('stapes');
var $ = require('jquery');

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
        this.props.login(user, pass);
    }
});

var User = Stapes.subclass({
    constructor: function() {
        this.children = {};
        this.initform();
    },
    initform: function () {
        this.loginform = <LoginForm key="user_login" login={this.login.bind(this)} />
        window.global.tools.set("Login", {node: this.loginform, right: true});
    },
    login: function(user, password) {
        var This = this;
        $.ajax({
            method: 'POST',
            url: "api/login/",
            data: JSON.stringify({user:user, password:password}),
            contentType: 'application/json',
            success: function(data) {
                if (data.ok) {
                    This.set('token', data.token);
                    This.set('user', user);
                    This.userprojects = data.projects;
                    window.global.tools.set("Login", {title: "Logout", right: true,
                        click: This.logout.bind(This)});
                    var list = "Welcome back, "+user+"\n## Your Projects\n";
                    Object.keys(data.projects).forEach(function(p) {
                        data.projects[p].user = user;
                        data.projects[p].name = p;
                        list += "- ["+p+"](#"+p+")\n";
                    });
                    var MDText = require(['./MDText'], function(MDText) {
                    window.global.views.add('projects', 'Projects', <MDText links={This.openProject.bind(This)} text={list} />);
                    });
                } else {
                    console.log(data.error);
                }
            }
        });
    },
    logout: function() {
        for (name in this.children) {
            this.children[name].close();
        }
        window.global.views.close('projects');
        this.initform();
    },
    openProject: function(name) {
        if (this.children[name]) {
            this.children[name].focus();
        } else {
            var p = window.global.open("Project", this.userprojects[name]);
            this.children[name] = p;
            p.on('close', function() {
                delete this.children[name];
            }, this);
        }
    }
});

module.exports = User;
