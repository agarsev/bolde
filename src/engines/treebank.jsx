"use strict";

var nedb = require('nedb');

var tbs = {};

self.onmessage = function (e) {
    var m = e.data;
    switch (m.event) {
    case 'store':
        tbs[m.name].insert(m.trees);
        break;
    case 'new':
        tbs[m.name] = new nedb();
        break;
    case 'query':
        tbs[m.name].find(m.query, function (err, docs) {
            if (err) {
                postMessage({ event: 'query', error: err, i: m.i });
            } else {
                postMessage({ event: 'query', result: docs, i: m.i });
            }
        });
        break;
    }
};
