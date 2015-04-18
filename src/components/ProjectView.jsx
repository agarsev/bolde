var React = require('react');
var Actions = require('./Actions');
var DirTree = require('./DirTree');

var ProjectView = React.createClass({
    render: function () {
        var p = window.ProjectStore.get(this.props.project);
        return (<DirTree files={p.files} path={p.user}
            openFile={this.openFile}
            name={p.name} />
        );
    },
    openFile: function (name) {
        Actions.open_file(name);
    }
});

module.exports = ProjectView;
