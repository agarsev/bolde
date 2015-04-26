"use strict";

var $ = require('jquery');

exports.call = function (url, data) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            method: 'POST',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (res) {
                if (res.ok) {
                    resolve(res.data);
                } else {
                    reject(res.error);
                }
            }
        }); // TODO other errors
    });
};
