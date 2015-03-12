var DirTree = React.createClass({
    getInitialState: function () {
        return { open: true };
    },
    toggleDir: function () {
        this.setState({open: !this.state.open});
    },
    render: function () {
        var below;
        if (this.state.open) {
            var list = this.props.data.map(function(file, i) {
                if (file.type=='dir') {
                    return(<li key={file.name}><DirTree name={file.name} data={file.files} /></li>);
                } else {
                    return(<li key={file.name}>{file.name}</li>);
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
