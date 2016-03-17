var React = require('react');
var Actions = require('../Actions');

var Row = require('./Row');

var t = require('tcomb-form');

class ProjectSnippet extends React.Component {

    constructor (props) {
        super(props);
        var p = props.project;
        window.ProjectStore.on(`changed:${p.user}/${p.name}`,
                               this.forceUpdate.bind(this));
    }

    render () {
        var p = this.props.project;
        var mode = this.props.mode;
        var desc = p.desc || 'Click edit to add a description...';
        var menu = {
            'Open': () => Actions.project.open(p.user, p.name)
        };
        if (window.UserStore.getUser()) {
            menu.Clone = () => Actions.prompt({
                model: t.struct({ name: t.Str })
            }).then(data => Actions.project.clone(p.user, p.name, data.name))
        };
        if (mode == "owner") {
            menu.Edit = {
                'Description': () => Actions.prompt({
                        model: t.struct({ description: t.Str, }),
                        value: { description: desc }
                    }).then(function (data) {
                        Actions.project.update_description(p.user, p.name, data.description);
                    }).catch(() => {}),
                'Share': () => Actions.prompt({
                        model: t.struct({ share: t.maybe(t.Str) }),
                        options: {
                            help: 'Comma-separated list of usernames, e.g: "john, mary, bill"',
                            auto: 'none',
                            legend: 'Share with: '
                        }, value: { share: p.shared.join(', ') }
                    }).then(data => this.update_share(data.share)),
                'Delete': () => Actions.prompt(undefined, 'Do you really want to delete '+p.name+'?')
                    .then(() => Actions.project.delete(p.name))
                    .catch(() => {})
            };
            if (p.public) {
                menu.Edit.Unpublish = () => Actions.prompt(undefined, 'Do you really want to unpublish '+p.name+'?')
                    .then(() => Actions.project.publish(p.name, false))
                    .catch(() => {});
            } else {
                menu.Edit.Publish = () => Actions.prompt(undefined, 'Make project '+p.name+' public?')
                    .then(() => Actions.project.publish(p.name, true))
                    .catch(() => {});
            };
        };
        return <Row title={this.props.name} collapsable={true} actions={menu}>
            <p>{desc}</p>
            {mode!=="read" && p.public?
                <p><i>This project is public</i></p>:null}
            {mode!=="read"?
                <p><a href={`api/project/backup/${p.user}/${p.name}`}>Download backup</a></p>:null}
        </Row>;
    }

    update_share (list) {
        var users = [];
        if (list) {
            users = list.split(/\s*,\s*/);
        }
        var p = this.props.project;
        Actions.project.share(p.user, p.name, users);
    }

}

module.exports = ProjectSnippet;
