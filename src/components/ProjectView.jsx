"use strict";

var React = require('react');
var t = require('tcomb-form');

var Actions = require('../Actions');
var DirTree = require('./DirTree');

require('styles/project');

class ProjectView extends React.Component {

    constructor (props) {
        super(props);
        this.state = {};
    }

    componentDidMount () {
        window.ProjectStore.on('changed:'+this.props.project, this.forceUpdate.bind(this));
    }

    render () {
        var p = window.ProjectStore.get(this.props.user, this.props.project);
        return (<div className="projectView">
            <span>
                <button title="copy" onClick={this.copySelected.bind(this)}>c</button>
                <button title="paste" onClick={this.paste.bind(this)}>p</button>
                <button title="new" onClick={this.newFile.bind(this)}>+</button>
                <button title="delete" onClick={this.deleteSelected.bind(this)}>x</button>
                <button title="run" onClick={this.run.bind(this)}>▶</button>
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
        Actions.file.open(this.props.user, this.props.project, file);
    }

    deleteSelected () {
        var file = this.state.selected;
        if (file !== undefined) {
            Actions.prompt(undefined, 'Do you really want to delete '+file+'?')
            .then(() => Actions.file.delete(this.props.user, this.props.project, file))
            .catch(() => {});
        }
    }

    copySelected () {
        var file = this.state.selected;
        if (file !== undefined) {
            Actions.file.copy(this.props.user, this.props.project, file);
        }
    }

    paste () {
        Actions.prompt({
            model: t.struct({
                filename: t.Str,
            })
        }).then(data => {
            Actions.file.paste_at_selected(this.props.user,
                     this.props.project, data.filename);
        }).catch(() => {});
    }

    newFile () {
        Actions.prompt({
            model: t.struct({
                filename: t.Str,
                type: t.enums({ text: 'text', json: 'grammar', dir: 'directory' })
            }),
            options: { fields: {
                type: { nullOption: false }
            }},
            value: { type: 'text' }
        }).then(data => {
            Actions.file.new_at_selected(this.props.user,
                     this.props.project, data.filename, data.type);
        }).catch(() => {});
    }

    run () {
        Actions.project.run(this.props.user,this.props.project);
    }

    selectFile (file, isdir) {
        this.setState({ selected: file, selisdir: isdir });
        if (isdir) {
            Actions.project.select_dir(this.props.user, this.props.project, file);
        } else {
            Actions.project.select_file(this.props.user, this.props.project, file);
        }
    }

};

module.exports = ProjectView;
