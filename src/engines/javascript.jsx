"use strict";

// TODO multiple runners, names
var name;
var runner;

self.onmessage = function ( e ) {
    var msg = e.data;
    switch (msg.event) {
        case 'config':
            name = msg.name;
            var body = msg.data.files.reduce((body, code) => body + ';' + code, '');
            runner = new Function('input', 'output', body);
            break;
        case 'input':
            runner(msg.data, function (text, detail) {
                postMessage({ event: 'output', name: msg.name, data: {msg:text, detail}});
            });
            postMessage({ event: 'finish', name: msg.name });
            break;
    }
};
