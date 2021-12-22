{merge} = require 'webpack-merge'
common = require './webpack.common.coffee'

module.exports = (env, args) -> [
  merge common.client(env, args), {
  }
  merge common.server(env, args), {
  }
  # merge common.cli(env, args), {
  # }
]