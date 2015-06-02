function chain (array, map, startvalue, startindex) {
    var i = startindex !== undefined ? startindex : array.length-1;
    var v = startvalue !== undefined ? startvalue : null;
    if (i<0) {
        return Promise.resolve(v);
    } else {
        return map(array[i], v)
        .then(function (result) {
            return chain (array, map, result, i-1);
        });
    }
}

exports.chain = chain;
