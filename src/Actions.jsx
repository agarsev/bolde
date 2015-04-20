var $ = require('jquery');

exports.open_project = function (name) {
    window.Dispatcher.dispatch({
        actionType: 'open_project',
        name: name
    });
};

exports.close_project = function (name) {
    window.Dispatcher.dispatch({
        actionType: 'close_project',
        name: name
    });
};

exports.open_message = function (title, text, links) {
    window.Dispatcher.dispatch({
        actionType: 'open_message',
        title: title,
        text: text,
        links: links
    });
};

exports.open_tab = function (id, title, node) {
    window.Dispatcher.dispatch({
        actionType: 'open_tab',
        id: id,
        title: title,
        node: node
    });
};

exports.close_tab = function (tabid) {
    window.Dispatcher.dispatch({
        actionType: 'close_tab',
        id: tabid
    });
};

exports.move_tab_panel = function (tabid, panel) {
    window.Dispatcher.dispatch({
        actionType: 'move_tab_panel',
        tab: tabid,
        panel: panel
    });
};

exports.focus_tab = function (tabid) {
    window.Dispatcher.dispatch({
        actionType: 'focus_tab',
        id: tabid
    });
};

exports.login = function (user, password) {
    $.ajax({
        method: 'POST',
        url: "api/login/",
        data: JSON.stringify({user:user, password:password}),
        contentType: 'application/json',
        success: function(data) {
            if (data.ok) {
                window.Dispatcher.dispatch({
                    actionType: 'login',
                    user: user,
                    token: data.token,
                    projects: data.projects
                });
            } else {
                console.log(data.error);
            }
        }
    });
};

exports.logout = function () {
    window.Dispatcher.dispatch({
        actionType: 'logout'
    });
};

exports.add_menu = function (id, title, menu, right) {
    window.Dispatcher.dispatch({
        actionType: 'add_tool',
        id: id,
        title: title,
        menu: menu,
        right: right
    });
};

exports.add_tool = function (id, title, click, right) {
    window.Dispatcher.dispatch({
        actionType: 'add_tool',
        id: id,
        title: title,
        click: click,
        right: right
    });
};

exports.remove_tool = function (id) {
    window.Dispatcher.dispatch({
        actionType: 'remove_tool',
        id: id
    });
};

exports.new_file = function (path) {
    $.ajax({
        method: 'POST',
        url: 'api/file/new/'+path,
        contentType: 'application/json',
        data: JSON.stringify({token: window.UserStore.getToken()}),
        success: function(data) {
            if (data.ok) {
                window.Dispatcher.dispatch({
                    actionType: 'new_file',
                    filename: path
                });
            } else {
                console.log(data.error);
            }
        }
    });
};

exports.delete_file = function (path) {
    $.ajax({
        method: 'POST',
        url: 'api/file/delete/'+path,
        contentType: 'application/json',
        data: JSON.stringify({token: window.UserStore.getToken()}),
        success: function(data) {
            if (data.ok) {
                window.Dispatcher.dispatch({
                    actionType: 'delete_file',
                    filename: path
                });
            } else {
                console.log(data.error);
            }
        }
    });
};

var load_file = function (path) {
    return new Promise(function (resolve, reject) {
        if (window.FileStore.isLoaded(path)) {
            resolve();
        } else {
            $.ajax({
                url: "api/sharejs/open/"+path,
                success: function(data) {
                    window.BCSocket = require("../node_modules/share/node_modules/browserchannel/dist/bcsocket.js").BCSocket;
                    require("../node_modules/share/webclient/share.js");
                    require("../node_modules/share/webclient/ace.js");

                    sharejs.open(data.name, 'text',
                        location.href.substr(0, location.href.search(/\/[^\/]*$/))+'/api/sharejs/channel',
                        function(error, doc) {
                            if (error) { reject(error); }
                            else {
                                window.Dispatcher.dispatch({
                                    actionType: 'load_file',
                                    filename: path,
                                    doc,
                                    mode: data.mode
                                });
                                resolve();
                            }
                        }
                    );
                }
            });
        }
    });
};
exports.load_file = load_file;

exports.open_file = function (path) {
    load_file(path).then(() =>
        window.Dispatcher.dispatch({
          actionType: 'open_file',
          filename: path
        }));
};

exports.close_file = function (filename) {
    window.Dispatcher.dispatch({
        actionType: 'close_file',
        filename: filename
    });
};

