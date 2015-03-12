var ViewList = Stapes.subclass({
});

var App = React.createClass({
    getInitialState: function () {
        var welcome = "Welcome back!\n" +
            "## Your projects\n" +
            "- [HPSG grammar](project.html)\n" +
            "- [CFG grammar](project.html)\n" +
            "- [Treebank](project.html)\n" +
            "- [Grammar for English](project.html)\n" +
            "- [FS Morphology](project.html)\n" +
            "- [Modern corpus](project.html)\n";
        var msg = "### Latest messages:\n" +
            "- Collaboration possibility for grammars\n" +
            "- Bug in HPSG interpreter\n" +
            "- New sentences in corpus\n";
        var longtext = welcome+welcome+welcome+welcome+welcome+welcome+welcome;
        var views = new ViewList();
        views.set("Welcome", { id: "Welcome", title: "Welcome", node: <MDText text={welcome} /> });
        views.set("Code", { id: "Code", title: "Code", node: <Editor /> });
        views.set("Long", { id: "Long", title: "Long text", node: <MDText text={longtext} />});
        return {
            views: views
        };
    },
    homeClick: function() {
        this.refs.tabpanel.focus("Code");
    },
    render: function () {
        return (
            <div className="React">
            <header>Prototype for master project</header>
            <nav>
                <a onClick={this.homeClick}>Home</a>
                <a href="index.html">Settings</a>
                <span className="spacer"></span>
                <a href="index.html">Logout</a>
            </nav>
            <TabPanel ref="tabpanel" views={this.state.views} />
            <footer>
                <span className="spacer"></span>
                <span>author: <a href="mailto:antonio@garciasevilla.com">Antonio F. G. Sevilla</a></span>
            </footer>
            </div>
       );
    },
});

window.onload = function() {
    React.render(<App />, document.body);
}
