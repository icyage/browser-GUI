const webpack = require('webpack')
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    return {
        mode: argv.mode == 'production' ? 'production' : 'development',
        entry: './src/main.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'app.bundle.js',
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 8111,
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        //'vue-style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.svg$/,
                    loader: 'svg-inline-loader'
                }
            ]
        },
        plugins: [
            new VueLoaderPlugin(),
            new CopyPlugin({
                patterns: [
                    { from: './src/index.html', to: '' },
                    { from: './src/images/logo_icon.svg', to: 'images/' }
                ],
            }),
            new webpack.DefinePlugin({
                GUI_VERSION: JSON.stringify('0.0.6.alpha')
            }),
        ]
    }
}