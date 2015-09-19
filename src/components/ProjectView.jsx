"use strict";

var React = require('react');
var t = require('tcomb-form');

var Actions = require('../Actions');
var DirTree = require('./DirTree');

require('styles/project');

class ProjectView extends React.Component {

    constructor (props) {
        super(props);
        var p = window.ProjectStore.get(this.props.project);
        this.state = { user: p.user, pname: p.name };
    }

    componentDidMount () {
        window.ProjectStore.on('changed:'+this.props.project, this.forceUpdate.bind(this));
    }

    render () {
        var p = window.ProjectStore.get(this.props.project);
        return (<div className="projectView">
            <span>
                <button onClick={this.newFile.bind(this)}>+</button>
                <button onClick={this.deleteSelected.bind(this)}>x</button>
                <button onClick={this.run.bind(this)}>⏵</button>
            </span>
            <span>
                <DirTree files={p.files} root="true"
                    selectFile={this.selectFile.bind(this)}
                    openFile={this.openFile.bind(this)}
                    name={p.name} />
            </span>
        </div>);
    }

    openFile (file) {
        Actions.file.open(this.state.user, this.state.pname, file);
    }

    deleteSelected () {
        var file = this.state.selected;
        if (file !== undefined) {
            Actions.prompt(undefined, 'Do you really want to delete '+file+'?')
            .then(() => Actions.file.delete(this.state.user, this.state.pname, file))
            .catch(() => {});
        }
    }

    newFile () {
        Actions.prompt({
            model: t.struct({
                filename: t.Str,
                type: t.enums({ text: 'text', grammar: 'grammar' })
            }),
            options: { fields: {
                type: { nullOption: false }
            }},
            value: { type: 'text' }
        }).then(data => {
            Actions.file.new_at_selected(window.UserStore.getUser(),
                     this.state.pname, data.filename, data.type);
        }).catch(() => {});
    }

    run () {
        Actions.project.run(window.UserStore.getUser()+'/'+this.state.pname);
    }

    selectFile (file, isdir) {
        this.setState({ selected: file, selisdir: isdir });
        if (isdir) {
            Actions.project.select_dir(this.state.user, this.state.pname, file);
        } else {
            Actions.project.select_file(this.state.user, this.state.pname, file);
        }
    }

};

module.exports = ProjectView;
