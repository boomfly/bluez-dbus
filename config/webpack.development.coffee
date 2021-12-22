{merge} = require 'webpack-merge'
common = require './webpack.common.coffee'
{BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

analyzer = false

module.exports = (env, args) ->
  [
    merge common.server(env, args), {
      devtool: 'inline-source-map'
    }
  ]