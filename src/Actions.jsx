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
/*
        if (this.children[name]) {
            this.children[name].focus();
        } else {
            var p = window.global.open("Project", this.userprojects[name]);
            this.children[name] = p;
            p.on('close', function() {
                delete this.children[name];
            }, this);
        }
*/

exports.open_file = function (filename) {
    window.Dispatcher.dispatch({
        actionType: 'open_file',
        filename: filename
    });
};

exports.close_file = function (filename) {
    window.Dispatcher.dispatch({
        actionType: 'close_file',
        filename: filename
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
