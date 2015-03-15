var DirTree = React.createClass({
    getInitialState: function () {
        var fullname = this.props.path?this.props.path+'/'+this.props.name:this.props.name;
        return { open: true, fullname: fullname };
    },
    toggleDir: function () {
        this.setState({open: !this.state.open});
    },
    clickFile: function (file) {
        this.props.openFile(file);
    },
    render: function () {
        var below;
        if (this.state.open) {
            var list = this.props.files.map(function(file, i) {
                if (file.type=='dir') {
                    return(<li key={file.name}><DirTree openFile={this.props.openFile} path={this.state.fullname} name={file.name} files={file.files} /></li>);
                } else {
                    return(<li key={file.name} onClick={this.clickFile.bind(this, this.state.fullname+'/'+file.name)}><a>{file.name}</a></li>);
                }
            }, this);
            below = <ul>{list}</ul>;
        }
        return (
            <div className="DirTree">
                <h3 onClick={this.toggleDir}>
                    <a>{this.state.open?'-':'+'}</a>
                    {this.props.name}
                </h3>
                {below}
            </div>
        );
    }
});
