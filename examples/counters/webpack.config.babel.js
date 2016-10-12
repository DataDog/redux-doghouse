import webpack from 'webpack';
import path from 'path';
import fs from 'fs';

import autoprefixer from 'autoprefixer';

const reduxDoghouseSrc = path.join(__dirname, '..', '..', 'src');
const reduxDoghouseNodeModules = path.join(__dirname, '..', '..', 'node_modules');

const isInDoghouseRepo =
    fs.existsSync(reduxDoghouseSrc) && fs.existsSync(reduxDoghouseNodeModules);

const doghouseLoader = {
    test: /\.js$/,
    loaders: ['babel-loader'],
    include: reduxDoghouseSrc
};

export default {
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ['babel-loader'],
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            loaders: ['style-loader', 'css-loader', 'postcss-loader']
        }].concat(isInDoghouseRepo ? doghouseLoader : []),
    },

    resolve: !isInDoghouseRepo ? {} : {
        alias: { 'redux-doghouse': reduxDoghouseSrc }
    },

    entry: [
        'webpack-hot-middleware/client?reload=true',
        path.join(__dirname, 'src', 'index')
    ],

    postcss: [autoprefixer],

    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/static/'
    },

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
};
