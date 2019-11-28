const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    target: "web",
    output: {
        path: __dirname + '/release',
        filename: 'index.js'
    },
    mode: "production",
    /*resolve: {
        modules: [path.resolve(__dirname, 'pixi.js/bundles/pixi.js/node_modules'), 'node_modules']
    },*/
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif|hdr)$/,
                use: 'url-loader'
            },
            {
                test: /\.mp3$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        mimetype: 'audio/mpeg',
                    }
                }]
            },
            {
                test: /\.mp4$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        mimetype: 'video/mp4',
                    }
                }]
            },
            {
                test: /\.ogg$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        mimetype: 'video/ogg',
                    }
                }]
            },
            {
                test: /\.obj/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        mimetype: 'text/plain',
                    }
                }]
            },
            {
                test: /\.js$/,
                exclude: /(bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        compact: true,
                        minified: true,
                        comments: false,
                        presets: [
                            ['@babel/preset-env', {loose: true}],
                            ['minify', {
                                builtIns: false,
                                simplify: false,
                                removeConsole: true,
                                removeDebugger: true
                            }]
                        ],
                        plugins: [
                            ['@babel/plugin-proposal-decorators', {legacy: true}],
                            ['@babel/plugin-proposal-class-properties', {loose: true}],
                            ['babel-plugin-transform-inline-environment-variables', {
                                include: [
                                    'BUILD_VERSION'
                                ]
                            }],
                            ['@babel/plugin-transform-runtime', {absoluteRuntime: true}]
                        ]
                    }
                }
            },
            {
                test: /\.(fnt|txt|frag|vert)$/,
                use: [
                    'raw-loader'
                ]
            }
        ],
    }/*,
    optimization: {
        minimizer: [new UglifyJSPlugin({
            uglifyOptions: {
                output: {
                    comments: false
                }
            }
        })],
    },*/
};