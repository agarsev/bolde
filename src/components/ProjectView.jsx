"use strict";

var React = require('react');
var Actions = require('../Actions');
var DirTree = require('./DirTree');

class ProjectView extends React.Component {

    componentDidMount () {
        window.ProjectStore.on('changed:'+this.props.project, this.forceUpdate.bind(this));
    }

    render () {
        var p = window.ProjectStore.get(this.props.project);
        return (<DirTree files={p.files} root="true"
            openFile={this.openFile.bind(this, p.user, p.name)}
            deleteFile={this.deleteFile.bind(this, p.user, p.name)}
            name={p.name} />
        );
    }

    openFile (user, project, file) {
        Actions.file.open(user, project, file);
    }

    deleteFile (user, project, file) {
        Actions.file.delete(user, project, file);
    }

};

module.exports = ProjectView;
