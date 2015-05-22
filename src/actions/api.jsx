"use strict";

function loading (yes) {
    window.Dispatcher.dispatch({ actionType: 'loading.'+(yes?'start':'end') });
};
exports.loading = loading;

exports.log = function (log, level) {
    if (level === undefined) { level = "ERROR"; }
    window.Dispatcher.dispatch({
        actionType: 'log.new',
        name: 'System',
        level: level,
        message: log,
    });
};

exports.call = function (url, data) {
    loading(true);
    return new Promise(function (resolve, reject) {
        var client = new XMLHttpRequest();
        client.open('POST', url);
        client.setRequestHeader('Content-type', 'application/json');
        client.onload = function () {
            if (this.status == 200) {
                var res = JSON.parse(this.response);
                if (res.ok) { resolve(res.data); }
                else { reject(res.error); }
            } else {
                reject('API call to '+url+': response '+this.status);
            }
            loading(false);
        };
        client.onerror = function () {
            reject(this.statusText);
            loading(false);
        };
        client.send(JSON.stringify(data));
    });
};
