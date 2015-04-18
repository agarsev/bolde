var React = require('react');

var DirTree = React.createClass({
    getInitialState: function () {
        var fullname = this.props.path+'/'+this.props.name;
        return { open: true, fullname: fullname, selected: this.props.selected };
    },
    toggleDir: function () {
        this.setState({open: !this.state.open});
    },
    clickFile: function (file, e) {
        if (this.props.selectFile) {
            this.props.selectFile(file);
        } else {
            this.setState({selected: file});
        }
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
    },
    dblClickFile: function (file, e) {
        this.props.openFile(file);
        e.stopPropagation();
        e.preventDefault();
    },
    deleteClick: function (file) {
        // TODO nested deleting
        this.props.deleteFile(file);
    },
    render: function () {
        var below;
        var selected = this.props.selected || this.state.selected;
        if (this.state.open) {
            var list = Object.keys(this.props.files).map(filename => {
                var file = this.props.files[filename];
                if (file.type=='dir') {
                    return(<li key={filename}>
                           <DirTree openFile={this.props.openFile} path={this.state.fullname}
                           selected={selected} selectFile={this.clickFile}
                           name={filename} files={file.files} />
                           </li>);
                } else {
                    var fullname = this.state.fullname+'/'+filename;
                    var remove;
                    if (selected == fullname) {
                        remove = <a onClick={this.deleteClick.bind(this, fullname)}>x</a>;
                    }
                    return(<li key={filename} className={selected==fullname?'selected':''}
                           onClick={this.clickFile.bind(this, fullname)}
                           onDoubleClick={this.dblClickFile.bind(this, fullname)}>
                           <a>{filename}</a>{remove}
                           </li>);
                }
            });
            below = <ul>{list}</ul>;
        }
        return (
            <div className="DirTree" onClick={this.clickFile.bind(this, '')}>
                <h3 className={selected==this.state.fullname?'selected':''}>
                    <a onClick={this.toggleDir}>{this.state.open?'-':'+'}</a>
                    <span onClick={this.clickFile.bind(this, this.state.fullname)}
                        onDoubleClick={this.toggleDir}>{this.props.name}</span>
                </h3>
                {below}
            </div>
        );
    }
});

module.exports = DirTree;
