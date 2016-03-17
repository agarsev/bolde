var React = require('react');
var Actions = require('../Actions');

class ProgressBar extends React.Component {

    constructor (props) {
        super(props);
        this.state = { progress: {} };
    }

    componentDidMount () {
        window.Dispatcher.register(a => {
            switch (a.actionType) {
                case 'progress':
                    this.setState({progress: a.progress});
                    break;
            }
        });
    }

    render () {
        var p = this.state.progress,
            k = Object.keys(p);
        if (k.length>0) {
            return <div className="loading" title={k.map(key => p[key].name).join(', ')} />;
        } else {
            return <div className="notloading"/>;
        }
    }

}

module.exports = ProgressBar;
