"use strict";

var React = require('react');

require('styles/dirtree');

class DirTree extends React.Component {

    constructor (props) {
        super(props);
        var fullname = '';
        if (!this.props.root) {
            if (this.props.path == '' && !!this.props.name) {
                fullname = this.props.name;
            } else {
                fullname = this.props.path+'/'+this.props.name;
            }
        }
        this.state = { open: true, fullname: fullname, selected: this.props.selected };
    }

    toggleDir () {
        this.setState({open: !this.state.open});
    }

    clickFile (file, isdir, e) {
        if (this.props.clickFile) {
            this.props.clickFile(file, isdir);
        } else {
            this.setState({selected: file});
            if (this.props.selectFile) {
                this.props.selectFile(file, isdir);
            }
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

    render () {
        var below;
        var selected = this.props.selected || this.state.selected;
        if (this.state.open) {
            var subdirs = {};
            var list = {};
            this.props.files.forEach(f => {
                var p = f.path;
                var slash = p.indexOf('/');
                if (slash >= 0) {
                    var dir = p.substr(0,slash);
                    var rest = { path: p.substr(slash+1), type: f.type };
                    if (subdirs[dir] === undefined) {
                        subdirs[dir] = [rest];
                    } else {
                        subdirs[dir].push(rest);
                    }
                } else if (f.type == 'dir') {
                    if (subdirs[p] === undefined) {
                        subdirs[p] = [];
                    }
                } else {
                    var fullname = this.props.root?p:this.state.fullname+'/'+p;
                    list[p] = <li key={p} className={selected==fullname?'selected':''}
                       onClick={this.clickFile.bind(this, fullname, false)}
                       onDoubleClick={this.dblClickFile.bind(this, fullname)}>
                       <a>{p}</a>
                   </li>;
                }
            });
            var ds = Object.keys(subdirs).sort().map(dir => <li key={dir}>
                <DirTree openFile={this.props.openFile} path={this.state.fullname}
                selected={selected} clickFile={this.clickFile.bind(this)}
                name={dir} files={subdirs[dir]} />
            </li>);
            below = <ul>{ds}{Object.keys(list).sort().map(l => list[l])}</ul>;
        }
        if (this.props.root) {
            return <div className="DirTree" >{below}</div>;
        } else {
            return (
                <div className="DirTree">
                    <h3 className={selected==this.state.fullname?'selected':''}>
                        <a onClick={this.toggleDir.bind(this)}>{this.state.open?'-':'+'}</a>
                        <span onClick={this.clickFile.bind(this, this.state.fullname, true)}
                            onDoubleClick={this.toggleDir.bind(this)}>{this.props.name}</span>
                    </h3>
                    {below}
                </div>
            );
        }
    }
};

module.exports = DirTree;
