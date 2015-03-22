var Stapes = require('stapes');
var React = require('react');

var ViewList = Stapes.subclass({
    add: function(id, title, node) {
        this.set(id, { id: id, title: title, node: node });
    },
    close: function(view) {
        if (this.has(view)) {
            this.remove(view);
        }
    }
});

module.exports = ViewList;
