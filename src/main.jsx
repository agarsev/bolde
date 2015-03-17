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

views.set("Welcome", { id: "Welcome", title: "Welcome", node: <MDText text={welcome} /> });

var tabpanel = React.render(<TabPanel views={views} />, document.getElementById('TabPanel'));

document.getElementById('Login').onclick = function() {
    var user = document.querySelector('input[name="user"]').value;
    var password = document.querySelector('input[name="password"]').value;
    $.ajax({
        method: 'POST',
        url: "api/login/",
        data: JSON.stringify({user:user, password:password}),
        contentType: 'application/json',
        success: function(data) {
            if (data.ok) {
                views.set("ProjectFiles", { id: "ProjectFiles", title: "Files",
                          node: <DirTree path="test" openFile={views.open.bind(views)} name={data.projects[0].name} files={data.projects[0].files} />});
            } else {
                console.log(data.error);
            }
        }
    });
}

} // window.onload();
