exports.parse = function (path) {
    return /^([^\/]+)\/([^\/]+)\/(.+)$/.exec(path);
};

exports.navigate = function (o) {
    while (res = /^([^\/]+)\/(.+)$/.exec(o.path)) {
        o.files = o.files[res[1]].files;
        o.path = res[2];
    }
};
