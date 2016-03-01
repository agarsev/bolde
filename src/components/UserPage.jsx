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
        return <Row title={user+": "+title} collapsable={true} actions={{
            'Delete': () => console.log('Delete'),
            'Reply': () => console.log('Reply')
            }}>
            <div className="conversationBody">
            {body.map((t, i) => <div key={i}>
                    <div>{t.me?"Me":user}</div>
                    <div dangerouslySetInnerHTML={{__html: md.render(t.me?t.me:t.them)}} />
            </div>)}
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
                <h2>New message</h2>
                To: <input ref="to" type="text" />
                Subject: <input ref="sub" type="text" />
                <textarea ref="txt" />
                <button onClick={this.sendMsg.bind(this)}>Send</button>
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

    sendMsg () {
        var to = React.findDOMNode(this.refs.to).value,
            sub = React.findDOMNode(this.refs.sub).value,
            txt = React.findDOMNode(this.refs.txt).value;
        Actions.user.message(to, sub, txt);
    }

};

module.exports = UserPage;
