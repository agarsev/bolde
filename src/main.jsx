window.onload = function () {

var ViewList = Stapes.subclass({
});

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
views.set("ProjectFiles", { id: "ProjectFiles", title: "Files", node: <DirTree name='Project' />});

tabpanel = React.render(<TabPanel views={views} />, document.getElementById('TabPanel'));

document.getElementById('Code').onclick = function () {
    tabpanel.focus("Code");
};

} // window.onload();
