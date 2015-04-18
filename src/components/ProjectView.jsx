var React = require('react');
var DirTree = require('./DirTree');

var ProjectView = React.createClass({
    render: function () {
        var p = window.ProjectStore.get(this.props.project);
        return (<DirTree files={p.files} path={p.user}
            openFile={() => alert('open')}
            name={p.name} />
        );
    }
});

module.exports = ProjectView;
