"use strict";

function loading (yes) {
    window.Dispatcher.dispatch({ actionType: 'loading.'+(yes?'start':'end') });
};
exports.loading = loading;

function syslog (log, level) {
    if (level === undefined) { level = "ERROR"; }
    window.Dispatcher.dispatch({
        actionType: 'log.new',
        name: 'System',
        level: level,
        message: log,
    });
};
exports.log = syslog;

var refresh_msg = false;
exports.call = function (url, data) {
    loading(true);
    return new Promise(function (resolve, reject) {
        var client = new XMLHttpRequest();
        client.open('POST', url);
        client.setRequestHeader('Content-type', 'application/json');
        client.onload = function () {
            if (this.status == 200) {
                var res = JSON.parse(this.response);
                if (res.ok === true) { resolve(res.data); }
                else { reject(res.error); }
            } else {
                reject('API call to '+url+': response '+this.status);
            }
            loading(false);
        };
        client.onerror = function (e) {
            if (this.statusText == "") {
                if (!refresh_msg) {
                    window.Dispatcher.dispatch({
                        actionType: 'prompt.in',
                        msg: 'The server seems to be unreachable. Do you want to refresh the page?',
                        reject: () => {},
                        resolve: () => { window.location.reload(); }
                    });
                    refresh_msg = true;
                }
                reject("No connection to the server");
            } else {
                reject(this.statusText);
            }
            loading(false);
        };
        client.send(JSON.stringify(data));
    })
    .catch(syslog);
};
