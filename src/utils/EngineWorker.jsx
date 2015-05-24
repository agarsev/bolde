/* # ENGINE COMMUNICATION API
 *
 * ## Per engine
 * -> new (name, config)
 * -> delete (name)
 *
 * ## Per worker
 * input (name, counter) -> input (name, counter, data)
 *                       -> end (name, counter)
 * log (name, level, message)
 * output (name, data)
 * finish (name)
 *
 */

"use strict";

var workers = {};

self.onmessage = function (e) {
    var m = e.data;
    var w = workers[m.name];
    if (w === undefined) {
        switch (m.event) {
        case 'new':
            workers[m.name] = new Worker(m.name, m.config);
            postMessage({ event: 'ready', name: m.name });
            break;
        }
    } else {
        switch (m.event) {
        case 'input':
            workers[m.name].onInput(m.data);
            break;
        case 'end':
            workers[m.name].onEnd();
            break;
        }
    }
}

class Worker {

    constructor ( name, config ) {
        this.w_name = name;
        this.w_counter = 0;
        this.w_promises = [];
        this.init(config);
    }

    init (config) { }

    log (level, message) {
        postMessage({ event: 'log', name: this.w_name, level, message });
    }

    output (data) {
        postMessage({ event: 'output', name: this.w_name, data });
    }

    finish () {
        postMessage({ event: 'finish', name: this.w_name });
        delete workers[this.w_name];
    }

    onInput (data) { }

    onEnd () { this.finish(); }
}

module.exports = Worker;
