module.exports = {
    context: __dirname+"/build",
    entry: "./main",
    output: {
        path: __dirname+"/build",
        filename: "bundle.js",
        publicPath: "build/"
    },
    module: {
        noParse: [
            /share/,
            /bower_components/
        ]
    }
};
