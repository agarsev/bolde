"use strict";

var Worker = require('../utils/EngineWorker');

function run () {
    this.input()
    .then(data => {
        this.runner(data, this.log.bind(this), this.output.bind(this), this.state);
        run.call(this);
    }).catch(this.finish.bind(this));
}

Worker.prototype.init = function (config) {
    var body = Object.keys(config.files).sort()
    .reduce((body, file) => body + ';' + config.files[file], '');
    this.runner = new Function('input', 'log', 'output', 'state', body);
    this.state = {};
    run.call(this);
}
