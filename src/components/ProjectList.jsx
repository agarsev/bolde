var React = require('react');
var Actions = require('../Actions');

class ProjectSnippet extends React.Component {

    constructor (props) {
        super(props);
        window.ProjectStore.on('changed:'+props.name, this.forceUpdate.bind(this));
    }

    render () {
        var name = this.props.name;
        var p = window.ProjectStore.get(name);
        var desc = p.desc || 'Edit this text to add a description...';
        return <li>
            <h3>{name}</h3>
            <p ref="desc" contentEditable="true" onBlur={this.updateDesc.bind(this)}>{desc}</p>
            <a onClick={() => Actions.project.open(name)}>Open</a>
            <a onClick={() => Actions.project.delete(name)}>Delete</a>
        </li>;
    }

    updateDesc () {
        var d = React.findDOMNode(this.refs.desc).textContent;
        Actions.project.update_description(this.props.name, d);
    }

}

class ProjectList extends React.Component {

    constructor (props) {
        super(props);
        window.ProjectStore.on('changed', this.forceUpdate.bind(this));
    }

    render () {
        return <div className="paper">
        <p>Welcome back, {window.UserStore.getUser()}</p>
        <h1>My Projects</h1>
        <ul>
        {window.ProjectStore.getAll().map(x => <ProjectSnippet key={x} name={x} />)}
        </ul>
        <a onClick={() => Actions.project.new()}>New project</a>
        </div>;
    }

}

module.exports = ProjectList;
