var React = require('react');
var Actions = require('../Actions');

var t = require('tcomb-form');
var Row = require('./Row');

class ProjectSnippet extends React.Component {

    constructor (props) {
        super(props);
        var p = props.project;
        window.ProjectStore.on(`changed:${p.user}/${p.name}`,
                               this.forceUpdate.bind(this));
    }

    render () {
        var p = this.props.project;
        var desc = p.desc || 'Click edit to add a description...';
        var menu = {
            'Open': () => Actions.project.open(p.user, p.name),
            'Clone': () => Actions.prompt({
                    model: t.struct({ name: t.Str })
                }).then(data => Actions.project.clone(p.user, p.name, data.name))
        };
        if (this.props.admin) {
            menu.Edit = {
                'Description': () => Actions.prompt({
                        model: t.struct({
                            description: t.Str,
                        }),
                        value: { description: desc }
                    }).then(function (data) {
                        Actions.project.update_description(p.user, p.name, data.description);
                    }).catch(() => {}),
                'Share': () => Actions.prompt({
                        model: t.list(t.Str),
                        value: p.shared.length>0?p.shared:['username']
                    }).then(data => Actions.project.share(p.user, p.name, data)),
                'Delete': () => Actions.prompt(undefined, 'Do you really want to delete '+p.name+'?')
                    .then(() => Actions.project.delete(p.name))
                    .catch(() => {}),
            };
        };
        return <Row title={this.props.name} collapsable={false} actions={menu}>
            <p>{desc}</p>
        </Row>;
    }

}

class ProjectList extends React.Component {

    constructor (props) {
        super(props);
        window.ProjectStore.on('changed', this.forceUpdate.bind(this));
    }

    newProj () {
        var name = prompt('New project name:');
        if (!name || name.length<1) { return; }
    }

    render () {
        var own;
        var shared = [];
        var projects = window.ProjectStore.getAll();
        var me = window.UserStore.getUser();
        Object.keys(projects).forEach(u => {
            var ps = projects[u];
            if (u == me) {
                own = Object.keys(ps).map(p =>
                    <ProjectSnippet key={`${u}/${p}`}
                         name={p} project={ps[p]} admin={true} />);
            } else {
                Object.keys(ps).forEach(p => {
                    shared.push(<ProjectSnippet key={`${u}/${p}`}
                         name={`${u}/${p}`} project={ps[p]} admin={false} />);
                 });
            }
        });
        return <div className="paper">
        <p>Welcome back, {window.UserStore.getUser()}</p>
        <h1>My Projects</h1>
        {own}
        <a onClick={() => Actions.prompt({
            model: t.struct({
                name: t.Str,
            }),
        }).then(function (data) {
            Actions.project.new(data.name);
        }).catch(() => {})}>New project</a>
        <h1>Projects shared with me</h1>
        {shared}
        </div>;
    }

}

module.exports = ProjectList;
