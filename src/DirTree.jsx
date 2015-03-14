var DirTree = React.createClass({
    getInitialState: function () {
        var fullname = this.props.path?this.props.path+'/'+this.props.name:this.props.name;
        return { open: false, ready: false, fullname: fullname, files: [] };
    },
    toggleDir: function () {
        this.setState({open: !this.state.open});
    },
    clickFile: function (file) {
        this.props.openFile(file);
    },
    componentDidMount: function () {
        $.ajax({
            url: "/api/list/"+this.state.fullname,
            success: function(data) {
                this.setState({ open: this.props.name==this.state.fullname, ready: true, files: data });
            }.bind(this)
        });
    },
    render: function () {
        var below;
        if (this.state.open) {
            var list = this.state.files.map(function(file, i) {
                if (file.type=='dir') {
                    return(<li key={file.name}><DirTree openFile={this.props.openFile} path={this.state.fullname} name={file.name} data={file.files} /></li>);
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
