// Gutter
define(["react"], function (React) { return React.createClass({
    getInitialState: function () {
        if (this.props.dir=="right") {
            return { handler: function(e) {
                this.style.width = e.clientX+"px";
            }};
        } else {
            return { handler: function(e) {
                this.style.width = (document.body.clientWidth-e.clientX)+"px";
            }};
        }
    },
    render: function () {
        return (
            <div onMouseDown={this.handleMouse}
                className="gutter" />
        );
    },
    handleMouse: function (e) {
        document.onmousemove = this.state.handler.bind(this.props.getTarget());
        document.onmouseup = function() {
            document.onmousemove = null;
        };
        e.preventDefault();
    }
});
}); // define
