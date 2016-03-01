var React = require('react');
var LoginForm = require('./LoginForm');
var Actions = require('../Actions');
var Form = require('./TForm');
var Row = require('./Row');

class Conversation extends React.Component {

    render () {
        var data = this.props.data;
        var them = data.user;
        return <Row title={data.title} collapsable={true} actions={{
            'Reply': () => console.log('Reply')
            }}>
            <div>{data.txt.map(t => t.me?
                <p><b>Me:</b> {t.me}</p>:
                <p><b>{them}:</b> {t.them}</p>
            )}</div>
        </Row>;
    }

};

class UserPage extends React.Component {

    constructor (props) {
        super(props);
        window.UserStore.on('changed', this.forceUpdate.bind(this));
    }

    render () {
        var convs = [
            { user: 'user', title: 'Cool', txt: [ { me: 'This thing is really cool' } ] },
            { user: 'teacher', title: 'Homework', txt: [ { them:'Please do your homework now'}, {me:"I'm on it"} ] }
        ];
        if (window.UserStore.isLogged()) {
            var u = window.UserStore.getUser();
            return <div className="paper">
                <p>{"Welcome back, "+u}</p>
                <h1>Messages</h1>
                {convs.map(c => <Conversation data={c} />)}
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
