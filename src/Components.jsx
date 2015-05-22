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

var Fo = require('./components/TForm');
exports.Form = function (onchange, getdata) {
    return <Fo onChange={onchange} getData={getdata} />;
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
exports.TBView = function (treebank) {
    return <TBV treebank={treebank} />;
};
