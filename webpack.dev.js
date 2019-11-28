const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
    target: "web",
    output: {
        path: __dirname + '/release',
        filename: 'index.js'
    },
    entry: [
        "./packages/index.js"
    ],
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        contentBase: __dirname + '/release',
        watchContentBase: true,
        allowedHosts: ['test.ts'],
        host: '0.0.0.0',
        port: 80
    },
    /*resolve: {
        modules: [path.resolve(__dirname, 'pixi.js/bundles/pixi.js/node_modules'), 'node_modules']
    },*/
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif|hdr)$/,
                use: [
                    'url-loader'
                ]
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
                        /*compact: true,
                        minified: true,
                        comments: false,*/
                        presets: [
                            ['@babel/preset-env', {loose: true}]
                        ],
                        plugins: [
                            ['@babel/plugin-proposal-decorators', {legacy: true}],
                            ['@babel/plugin-proposal-class-properties', {loose: true}],
                            ['babel-plugin-transform-inline-environment-variables', {
                                include: ['BUILD_VERSION']
                            }],
                            //['@babel/plugin-transform-runtime', {absoluteRuntime: true}]
                        ]
                    }
                }
            },
            {
                test: /\.(fnt|txt|frag|vert|dds)$/,
                use: [
                    'raw-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/fb_portrait.ejs',
            inlineSource: '.(js|css)$'
        }),
        new HtmlWebpackInlineSourcePlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
};