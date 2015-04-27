"use strict";

var React = require('react');

class DirTree extends React.Component {

    constructor (props) {
        super(props);
        var fullname = '';
        if (!this.props.root) {
            fullname = this.props.path+'/'+this.props.name;
        } else if (this.props.path == '' && !!this.props.name) {
            fullname = this.props.name;
        }
        this.state = { open: true, fullname: fullname, selected: this.props.selected };
    }

    toggleDir () {
        this.setState({open: !this.state.open});
    }

    clickFile (file, e) {
        if (this.props.selectFile) {
            this.props.selectFile(file);
        } else {
            this.setState({selected: file});
        }
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    dblClickFile (file, e) {
        this.props.openFile(file);
        e.stopPropagation();
        e.preventDefault();
    }

    deleteClick (file, e) {
        // TODO nested deleting
        this.props.deleteFile(file);
        e.stopPropagation();
        e.preventDefault();
    }

    render () {
        var below;
        var selected = this.props.selected || this.state.selected;
        if (this.state.open) {
            var list = Object.keys(this.props.files).map(filename => {
                var file = this.props.files[filename];
                if (file.type=='dir') {
                    return(<li key={filename}>
                           <DirTree openFile={this.props.openFile} path={this.state.fullname}
                           selected={selected} selectFile={this.clickFile.bind(this)}
                           name={filename} files={file.files} />
                           </li>);
                } else {
                    var fullname = this.props.root?filename:this.state.fullname+'/'+filename;
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
        if (this.props.root) {
            return <div className="DirTree" >{below}</div>;
        } else {
            return (
                <div className="DirTree">
                    <h3 className={selected==this.state.fullname?'selected':''}>
                        <a onClick={this.toggleDir.bind(this)}>{this.state.open?'-':'+'}</a>
                        <span onClick={this.clickFile.bind(this, this.state.fullname)}
                            onDoubleClick={this.toggleDir.bind(this)}>{this.props.name}</span>
                    </h3>
                    {below}
                </div>
            );
        }
    }
};

module.exports = DirTree;
