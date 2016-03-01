var React = require('react');
var Actions = require('../Actions');

var t = require('tcomb-form');
var Row = require('./Row');

class ProjectSnippet extends React.Component {

    constructor (props) {
        super(props);
        window.ProjectStore.on('changed:'+props.name, this.forceUpdate.bind(this));
    }

    render () {
        var name = this.props.name;
        var p = window.ProjectStore.get(name);
        var desc = p.desc || 'Click edit to add a description...';
        return <Row title={name} collapsable={false} actions={{
                'Open': () => Actions.project.open(name),
                'Clone': () => Actions.prompt({
                    model: t.struct({ name: t.Str })
                }).then(data => Actions.project.clone(name, data.name)),
                'Delete': () => Actions.prompt(undefined, 'Do you really want to delete '+name+'?')
                .then(() => Actions.project.delete(name))
                .catch(() => {}),
                'Edit': {
                    'Description': () => Actions.prompt({
                        model: t.struct({
                            description: t.Str,
                        }),
                        value: { description: desc }
                    }).then(function (data) {
                        Actions.project.update_description(name, data.description);
                    }).catch(() => {})
                }
            }}>
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
        return <div className="paper">
        <p>Welcome back, {window.UserStore.getUser()}</p>
        <h1>My Projects</h1>
        {window.ProjectStore.getAll().map(x => <ProjectSnippet key={x} name={x} />)}
        <a onClick={() => Actions.prompt({
            model: t.struct({
                name: t.Str,
            }),
        }).then(function (data) {
            Actions.project.new(data.name);
        }).catch(() => {})}>New project</a>
        </div>;
    }

}

module.exports = ProjectList;
