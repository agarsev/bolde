var pid = 0;
var progress = {};

exports.start = function (name) {
    var id = pid;
    pid += 1;
    progress[id] = { name };
    window.Dispatcher.dispatch({
        actionType: 'progress',
        progress
    });
    return id;
};

exports.stop = function (id) {
    delete progress[id];
    window.Dispatcher.dispatch({
        actionType: 'progress',
        progress
    });
};
