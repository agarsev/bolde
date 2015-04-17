var AVM = React.createClass({
    getInitialState: function () {
        return { obj: this.props.data };
    },
    render: function () {
        return (
            <span><b>type:</b> {this.state.obj._type}</span>
        );
    },
});
