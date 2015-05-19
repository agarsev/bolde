"use strict";

window.URL = window.URL || window.webkitURL;

var engines = {};

exports.start = function (engine) {
    if (engines[engine] === undefined) {
        var w = new Worker('engines/'+engine+'.js');
        var eng = { w, source: {}, sink: {} };
        w.onmessage = function (e) {
            var m = e.data;
            switch (m.event) {
            case 'input':
                eng.source[m.name].get()
                .then(function (data) {
                    w.postMessage({ event: 'input', name: m.name, counter: m.counter, data });
                }).catch(function () {
                    w.postMessage({ event: 'end', name: m.name, counter: m.counter });
                });
                break;
            case 'output':
                eng.sink[m.name].put(m.data);
                break;
            case 'log':
                window.Dispatcher.dispatch({
                    actionType: 'log.new',
                    name: m.name,
                    level: m.level,
                    message: m.message,
                });
                break;
            case 'finish':
                eng.sink[m.name].close();
                delete eng.source[m.name];
                delete eng.sink[m.name];
                break;
            };
        };
        engines[engine] = eng;
    }
};

exports.run = function (engine, name, config, source, sink) {
    engines[engine].source[name] = source;
    engines[engine].sink[name] = sink;
    engines[engine].w.postMessage({
        event: 'new', name, config
    });
};
