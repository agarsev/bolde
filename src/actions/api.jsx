"use strict";

exports.call = function (url, data) {
    return new Promise(function (resolve, reject) {
        window.Dispatcher.dispatch({ actionType: 'loading.start' });
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
            window.Dispatcher.dispatch({ actionType: 'loading.end' });
        };
        client.onerror = function () {
            reject(this.statusText);
            window.Dispatcher.dispatch({ actionType: 'loading.end' });
        };
        client.send(JSON.stringify(data));
    });
};
