exports.parse = function (path) {
    return /^([^\/]+)\/([^\/]+)\/(.+)$/.exec(path);
};
