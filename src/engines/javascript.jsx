"use strict";

var Worker = require('../engine_api');

Worker.prototype.init = function (config) {
    var body = config.files.reduce((body, code) => body + ';' + code, '');
    var runner = new Function('input', 'log', 'output', body);
    this.input()
    .then(data => runner(data, this.log.bind(this), this.output.bind(this)))
    .catch(this.finish.bind(this));
};
