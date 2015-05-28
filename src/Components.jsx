"use strict";

var React = require('react');

var MDT = require('./components/MDText');
exports.MDText = function (text, links) {
    return <MDT text={text} links={links} />;
};

var PV = require('./components/ProjectView');
exports.ProjectView = function (project) {
    return <PV project={project} />;
};

var PL = require('./components/ProjectList');
exports.ProjectList = function () {
    return <PL />;
};

var Ed = require('./components/Editor');
exports.Editor = function (filename) {
    return <Ed filename={filename} />;
};

var VEd = require('./components/VisualEditor');
exports.VisualEditor = function (filename) {
    return <VEd filename={filename} />;
};

var Fo = require('./components/TForm');
exports.Form = function (title, onchange, getdata) {
    return <Fo title={title} onChange={onchange} getData={getdata} />;
};

var LV = require('./components/LogView');
exports.LogView = function (filter) {
    return <LV filter={filter} />;
};

var BT = require('./components/BorjesTree');
exports.BorjesTree = function (tree) {
    return <BT tree={tree} />;
};

var TBV = require('./components/TBView');
exports.TBView = function (trees, temporary) {
    if (temporary) {
        return <TBV list={trees} />;
    } else {
        return <TBV treebank={trees} />;
    }
};
