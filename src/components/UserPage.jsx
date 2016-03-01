var React = require('react');
var t = require('tcomb-form');

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
            'Delete': () => Actions.user.clearConversation(user, title),
            'Reply': () => this.props.reply(user, title)
            }}>
            <div className="conversationBody">
            {body.map((t, i) => <div key={i} className={t.me?"meMessage":"themMessage"}>
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
                {Object.keys(ms).map(c => <Conversation key={c} name={c}
                                     body={ms[c]}
                                     reply={this.sendMsg.bind(this)}
                                     />)}
                <button onClick={this.sendMsg.bind(this, undefined, undefined)}>New message</button>
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

    sendMsg (to, subject) {
        Actions.prompt({
            model: t.struct({
                To: t.Str,
                Subject: t.Str,
                Message: t.Str
            }),
            options: { fields: {
                Message: {
                    type: 'textarea',
                    auto: 'placeholders'
                }
            }},
            value:  {
                To: to,
                Subject: subject
            }
        }).then(data => Actions.user.message(data.To, data.Subject, data.Message))
        .catch(() => {});
    }

};

module.exports = UserPage;
