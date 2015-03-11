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
        var views = [];
        views.push({
            title: "Welcome",
            panel: 1,
            node: <MDText key="Welcome" title="Welcome" text={welcome} />
        });
        views.push({
            title: "Code",
            panel: 2,
            node: <Editor key="Code" title="Code" />
        });
        views.push({
            title: "Long text",
            panel: 2,
            node: <MDText key="Long text" title="Long text" text={longtext} />
        });
        return {
            selected: [ 0, "Welcome", "Code"],
            views: views
        };
    },
    tabHandler: function (tab) {
        var centralrect = this.refs.centraltab.getDOMNode().getBoundingClientRect();
        var views = this.state.views;
        var firstsel = [];
        var i;
        for (var j=0; j<views.length; j++) {
            if (views[j].title==tab) {
                i=j;
            }
        }
        for (var j=0; j<3; j++) {
            firstsel[j] = this.state.selected[j];
        }
        for (var j=0; j<views.length; j++) {
            if (views[j].panel==views[i].panel && i!=j) {
                firstsel[views[j].panel] = views[j].title;
            }
        }
        document.onmousemove = function(e) {
            var s = this.state.selected;
            s[views[i].panel]=firstsel[views[i].panel];
            if (e.clientX<centralrect.left) {
                views[i].panel = 0;
            } else if (e.clientX>centralrect.right) {
                views[i].panel = 2;
            } else {
                views[i].panel = 1;
            }
            s[views[i].panel]=tab;
            this.setState({views: views, selected: s});
        }.bind(this);
        document.onmouseup = function(e) {
            var s = this.state.selected;
            s[views[i].panel]=tab;
            this.setState({selected: s});
            document.onmousemove = null;
            document.onmouseup = null;
        }.bind(this);
    },
    render: function () {
        var a = this.state.views.filter(function(x){return x.panel==1;})
                                .map(function(x){return x.node;});
        return (<div className="React">
            <header>Prototype for master project</header>
            <nav>
                <a href="index.html">Home</a>
                <a href="index.html">Settings</a>
                <span className="spacer"></span>
                <a href="index.html">Logout</a>
            </nav>
            <main>
                <Tabs ref="lefttab"
                    selected={this.state.selected[0]}
                    handler={this.tabHandler}>
                {this.state.views.filter(function(x){return x.panel==0;})
                                .map(function(x){return x.node;})}
                </Tabs>
                <Gutter dir="right" getTarget={this.refDOM.bind(this, 'lefttab')} handler={this.tabHandler}/>
                <Tabs ref="centraltab" style={{flex:1}}
                    selected={this.state.selected[1]}
                    handler={this.tabHandler}>
                {this.state.views.filter(function(x){return x.panel==1;})
                                .map(function(x){return x.node;})}
                </Tabs>
                <Gutter dir="left" getTarget={this.refDOM.bind(this, 'righttab')} />
                <Tabs ref="righttab"
                    selected={this.state.selected[2]}
                    handler={this.tabHandler}>
                {this.state.views.filter(function(x){return x.panel==2;})
                                .map(function(x){return x.node;})}
                </Tabs>
            </main>
            <footer>
                <span className="spacer"></span>
                <span>author: <a href="mailto:antonio@garciasevilla.com">Antonio F. G. Sevilla</a></span>
            </footer>
            </div>);
    },
    refDOM: function (name) {
        return this.refs[name].getDOMNode();
    }
});

window.onload = function() {
    React.render(<App />, document.body);
}
