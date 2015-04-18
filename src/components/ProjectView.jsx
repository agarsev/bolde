var React = require('react');
var Actions = require('./Actions');
var DirTree = require('./DirTree');

var ProjectView = React.createClass({
    componentDidMount: function () {
        window.ProjectStore.on('changed:'+this.props.project, this.forceUpdate, this);
    },
    render: function () {
        var p = window.ProjectStore.get(this.props.project);
        return (<DirTree files={p.files} path={p.user}
            openFile={this.openFile}
            deleteFile={this.deleteFile}
            name={p.name} />
        );
    },
    openFile: function (name) {
        Actions.open_file(name);
    },
    deleteFile: function (name) {
        Actions.delete_file(name);
    }
});

module.exports = ProjectView;
