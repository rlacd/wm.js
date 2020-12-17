/**
 * Webpack config file for wm.js
 */

module.exports = {
    mode: 'production',
    entry: './source/wm.js',
    output: {
        filename: 'dist/wm.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: []
    },
    plugins: []
}
