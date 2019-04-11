const path = require('path'); 
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = { 
  entry: {
      "ctmap":"./src/CTSchoolMap",
  },
  output: {
    path: path.resolve('./dist'), 
    filename: '[name]-bundle.js',
    umdNamedDefine: true
  }, 
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
//          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      }
     ]
 }  
} 