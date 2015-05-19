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
            case 'input':
                eng.workers[m.name].source.get()
                .then(function (data) {
                    w.postMessage({ event: 'input', name: m.name, counter: m.counter, data });
                }).catch(function () {
                    w.postMessage({ event: 'end', name: m.name, counter: m.counter });
                });
                break;
            case 'output':
                eng.workers[m.name].sink.put(m.data);
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
                eng.workers[m.name].sink.close();
                w.postMessage({ event: 'delete', name: m.name });
                delete eng.workers[m.name];
                break;
            };
        };
        engines[engine] = eng;
    }
};

exports.run = function (engine, title, config, source, sink) {
    var e = engines[engine];
    var name = id++;
    e.workers[name] = { source, sink, title };
    e.w.postMessage({ event: 'new', name, config });
};
