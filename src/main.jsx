window.onload = function () {

var tabpanel;

var ViewList = Stapes.subclass({
    open: function(filename) {
        var key = 'open'+filename;
        if (this.has(key)) {
            tabpanel.focus(key);
        } else {
            this.set(key,
                     { id: key
                     , title: filename.substr(filename.search(/\/[^\/]+$/)+1)
                     , node: <Editor filename={filename} />
                     });
        }
    }
});

var views = new ViewList();

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

views.set("Welcome", { id: "Welcome", title: "Welcome", node: <MDText text={welcome} /> });
views.set("Long", { id: "Long", title: "Long text", node: <MDText text={longtext} />});
views.set("ProjectFiles", { id: "ProjectFiles", title: "Files", node: <DirTree openFile={views.open.bind(views)} name='Project' />});

var tabpanel = React.render(<TabPanel views={views} />, document.getElementById('TabPanel'));

} // window.onload();
