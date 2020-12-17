/**
 * Webpack config file for wm.js.
 * 
 * This configuration builds wm.js and places generated files in `dist/`.
 */

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './source/index.js',
    output: {
        filename: 'wm.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: "wm.js (C) acdra1n 2020. Licensed under GNU GPLv3.\nhttps://github.com/acdra1n/wm.js/"
        }),
        new CssMinimizerPlugin(),
        new MiniCssExtractPlugin({
            filename: "wm.min.css"
        }),
    ]
}
