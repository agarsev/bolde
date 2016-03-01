var React = require('react');
var LoginForm = require('./LoginForm');
var Actions = require('../Actions');
var Form = require('./TForm');

class UserPage extends React.Component {

    constructor (props) {
        super(props);
        window.UserStore.on('changed', this.forceUpdate.bind(this));
    }

    render () {
        if (window.UserStore.isLogged()) {
            var u = window.UserStore.getUser();
            return <div className="paper">
                <p>{"Welcome back, "+u}</p>
                <Form title='Settings' onChange={Actions.user.changeSettings} getData={window.UserStore.getSettingsForm.bind(window.UserStore)} />
            </div>;
        } else {
            var error = window.UserStore.getLoginError();
            return <div className="paper">
                <p>Please log in or register to access BOLDE</p>
                <h3>Login</h3>
                <LoginForm />
                <h3>Register</h3>
                <LoginForm action="register" />
                {error?<span style={{fontSize: "80%", color:"red", fontStyle: 'oblique', paddingRight: '0.6em'}}>{error}</span>:null}
            </div>;
        }
    }

};

module.exports = UserPage;
