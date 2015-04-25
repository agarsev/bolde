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
        return (<DirTree files={p.files} path={p.user}
            openFile={this.openFile}
            deleteFile={this.deleteFile}
            name={p.name} />
        );
    }

    openFile (name) {
        Actions.file.open(name);
    }

    deleteFile (name) {
        Actions.file.delete(name);
    }

};

module.exports = ProjectView;
