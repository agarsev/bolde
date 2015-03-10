var App = React.createClass({
    getInitialState: function () {
        return {
            views: []
        };
    },
    render: function () {
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
        return (<div className="React">
            <header>Prototype for master project</header>
            <nav>
                <a href="index.html">Home</a>
                <a href="index.html">Settings</a>
                <span className="spacer"></span>
                <a href="index.html">Logout</a>
            </nav>
            <main>
                <Tabs ref="lefttab" />
                <Gutter dir="right" getTarget={this.refDOM('lefttab')} />
                <Tabs style={{flex:1}}>
                    <MDText title="Welcome" text={welcome} />
                </Tabs>
                <Gutter dir="left" getTarget={this.refDOM('righttab')} />
                <Tabs ref="righttab" className="lateral">
                    <Editor title="Code" />
                    <MDText title="Long text" text={longtext} />
                    <MDText title="Messages" text={msg} />
                </Tabs>
            </main>
            <footer>
                <span className="spacer"></span>
                <span>author: <a href="mailto:antonio@garciasevilla.com">Antonio F. G. Sevilla</a></span>
            </footer>
            </div>);
    },
    refDOM: function (name) {
        return function() { return this.refs[name].getDOMNode(); }.bind(this);
    }
});

window.onload = function() {
    React.render(<App />, document.body);
}
