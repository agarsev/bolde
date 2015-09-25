"use strict";

var Borjes = require('borjes');

var Worker = require('../utils/EngineWorker');

Worker.prototype.init = function (config) {
    var body = Object.keys(config.files).sort()
    .reduce((body, file) => body + ';' + config.files[file], '');
    this.runner = new Function('input', 'log', 'output', 'state', 'Borjes', body);
    this.state = {};
};

Worker.prototype.onInput = function (data) {
    this.runner(data, this.log.bind(this), this.output.bind(this), this.state, Borjes);
};
