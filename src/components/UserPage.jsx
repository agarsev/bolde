var React = require('react');
var LoginForm = require('./LoginForm');
var Actions = require('../Actions');
var Form = require('./TForm');
var Row = require('./Row');

var markdownit = require('markdown-it');
var md = markdownit({html: true});

class Conversation extends React.Component {

    render () {
        var name = this.props.name,
            body = this.props.body,
            split = name.split('%%'),
            user = split[1],
            title = split[0];
        return <Row title={title} collapsable={true} actions={{
            'Delete': () => console.log('Delete'),
            'Reply': () => console.log('Reply')
            }}>
            <div className="conversationBody">
            {body.map((t, i) => <p key={i}>
                    <span>{t.me?"Me":user}</span>
                    <span dangerouslySetInnerHTML={{__html: md.render(t.me?t.me:t.them)}} />
            </p>)}
            </div>
        </Row>;
    }

};

class UserPage extends React.Component {

    constructor (props) {
        super(props);
        window.UserStore.on('changed', this.forceUpdate.bind(this));
    }

    render () {
        var us = window.UserStore;
        if (us.isLogged()) {
            var u = us.getUser();
            var ms = us.getMessages();
            return <div className="paper">
                <p>{"Welcome back, "+u}</p>
                <h1>Conversations</h1>
                {Object.keys(ms).map(c => <Conversation key={c} name={c} body={ms[c]} />)}
                <Form title='Settings' onChange={Actions.user.changeSettings} getData={us.getSettingsForm.bind(us)} />
            </div>;
        } else {
            var error = us.getLoginError();
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
