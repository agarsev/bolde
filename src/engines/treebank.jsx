"use strict";

var nedb = require('nedb');

var Borjes = require('borjes');
var Tree = Borjes.Tree;
var FStruct = Borjes.types.FStruct;
var s_parse = Borjes.parenthesis;

var tbs = {};

self.onmessage = function (e) {
    var m = e.data;
    switch (m.event) {
    case 'store':
        for (var i = 0; i<m.trees.length; i++) {
            store(tbs[m.name], m.trees[i]);
        }
        break;
    case 'new':
        tbs[m.name] = { db: new nedb(), i: 0 };
        break;
    case 'query':
        var q = prepare_query(m.query);
        var db = tbs[m.name].db;
        db.find(q, function (err, docs) {
            if (err) {
                postMessage({ event: 'query', error: err, i: m.i });
            } else {
                var ids = {};
                for (var j=0; j<docs.length; j++) {
                    var d = docs[j];
                    if (ids[d.tree_id]===undefined) {
                        ids[d.tree_id] = true;
                    }
                }
                db.find({ _id: { $in: Object.keys(ids) } }, function (err, docs) {
                    if (err) {
                        postMessage({ event: 'query', error: err, i: m.i });
                    } else {
                        postMessage({ event: 'query', result: docs.map(x => x.tree), i: m.i });
                    }
                });
            }
        });
        break;
    }
};

function store (tb, tree) {
    var id = 'tree_'+(tb.i++);
    tb.db.insert({ _id: id, tree: tree });

    var sexp = Tree.to_sexp(tree, x => {
        if (x.borjes === 'fstruct') {
            return FStruct.get(x, 'symbol').s;
        } else {
            return x;
        }
    });
    var queue = [sexp];
    while (queue.length>0) {
        var node = queue.shift();
        setTimeout(tb.db.insert.bind(tb.db, { node, tree_id: id }), 0);
        for (var i=1; i<node.length; i++) {
            queue.push(node[i]);
        }
    }
}

function prepare_query (query) {
    var q = {};
    function callback (attr, val) {
        if (val !== '_') { q['node'+attr] = val; }
    }
    function parse_sexp (sexp, attr, val) {
        for (var i=0; i<sexp.length; i++) {
            if (i == 0) {
                callback(attr+".0", val[0]);
            } else {
                parse_sexp(sexp[i], attr+"."+i, val[i]);
            }
        }
    }
    var s = s_parse(query);
    parse_sexp(s, "", s);
    return q;
}
