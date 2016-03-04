/*jslint node: true, nomen: true*/
var path = require('path');
var webpack = require('webpack');

module.exports = {
	context: path.join(__dirname, 'client'),
	entry: './index.js',
	devtool: 'source-map',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'panic.min.js'
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			minimize: true
		})
	]
};
