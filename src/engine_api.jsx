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
            break;
        }
    } else {
        switch (m.event) {
        case 'input':
            var resolve = w.w_promises[m.counter][0];
            resolve(m.data);
            break;
        case 'end':
            var reject = w.w_promises[m.counter][1];
            reject();
            break;
        case 'delete':
            delete workers[m.name];
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
        delete workers[worker.name];
    }

    input () {
        var i = this.w_counter++;
        postMessage({ event: 'input', name: this.w_name, counter: i });
        var p = new Promise((resolve, reject) => {
            this.w_promises[i] = [resolve, reject];
        });
        return p;
    }
}

module.exports = Worker;
