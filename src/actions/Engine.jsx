"use strict";

window.URL = window.URL || window.webkitURL;

var engines = {};

var id = 0;

exports.start = function (engine) {
    if (engines[engine] === undefined) {
        var w = new Worker('engines/'+engine+'.js');
        var eng = { w, workers: {} };
        w.onmessage = function (e) {
            var m = e.data;
            switch (m.event) {
            case 'ready':
                eng.workers[m.name].ready();
                delete eng.workers[m.name]["ready"];
                break;
            case 'output':
                if (eng.workers[m.name].after !== null) {
                    eng.workers[m.name].after.put(m.data);
                }
                break;
            case 'log':
                window.Dispatcher.dispatch({
                    actionType: 'log.new',
                    name: eng.workers[m.name].title,
                    level: m.level,
                    message: m.message,
                });
                break;
            case 'finish':
                if (eng.workers[m.name].after !== null) {
                    eng.workers[m.name].after.close();
                }
                delete eng.workers[m.name];
                break;
            };
        };
        engines[engine] = eng;
    }
};

exports.run = function (engine, title, config, after) {
    var e = engines[engine];
    var w = e.w;
    var name = id++;
    e.workers[name] = { after, title };
    var r = new Promise(function (resolve, reject) {
        e.workers[name].ready = function () {
            resolve({
                put: (data) => w.postMessage({ event: 'input', name, data }),
                close: () => w.postMessage({ event: 'end', name })
            });
        };
    });
    w.postMessage({ event: 'new', name, config });
    return r;
};
