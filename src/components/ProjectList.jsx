var React = require('react');
var Actions = require('../Actions');

var ProjectSnippet = require('./ProjectSnippet');

var t = require('tcomb-form');

class ProjectList extends React.Component {

    constructor (props) {
        super(props);
        window.ProjectStore.on('changed', this.forceUpdate.bind(this));
    }

    newProj () {
        var name = prompt('New project name:');
        if (!name || name.length<1) { return; }
    }

    render () {
        var own;
        var shared = [], publics = [];
        var projects = window.ProjectStore.getAll();
        var me = window.UserStore.getUser();
        Object.keys(projects).forEach(u => {
            var ps = projects[u];
            if (u == me) {
                own = Object.keys(ps).map(p =>
                    <ProjectSnippet key={`${u}/${p}`}
                         name={p} project={ps[p]} mode="owner" />);
            } else {
                Object.keys(ps).forEach(p => {
                    if (ps[p].readonly) {
                        publics.push(<ProjectSnippet key={`${u}/${p}`}
                             name={`${u}/${p}`} project={ps[p]} mode="read" />);
                    } else {
                        shared.push(<ProjectSnippet key={`${u}/${p}`}
                             name={`${u}/${p}`} project={ps[p]} mode="share" />);
                    }
                 });
            }
        });
        if (me) {
            return <div className="paper">
                <p>Welcome back, {me}</p>
                <h1>My Projects</h1>
                {own}
                <p><button onClick={() => Actions.prompt({
                    model: t.struct({
                        name: t.Str,
                    }),
                }).then(function (data) {
                    Actions.project.new(data.name);
                }).catch(() => {})}>New project</button></p>
                    <div><form style={{display:'inline'}} ref={d=>this.restorefile=d}>
                        <input name="zip" type="file" />
                    </form>
                    <button onClick={() => Actions.prompt({
                            model: t.struct({ name: t.Str }),
                            options: { label: 'New project name', auto: 'none' }
                        }).then(data => {
                            var form = this.restorefile;
                            var FD = new FormData(form);
                            FD.append('user', window.UserStore.getUser());
                            FD.append('project', data.name);
                            Actions.project.restore(FD);
                        }).catch(() => {})}>Restore project</button>
                </div>
                {shared.length>0?<h1>Projects shared with me</h1>:null}
                {shared}
                <h1>Public projects</h1>
                {publics}
                </div>;
        } else {
            return <div className="paper">
                <h1>Public projects</h1>
                {publics}
            </div>;
        }
    }

}

module.exports = ProjectList;
