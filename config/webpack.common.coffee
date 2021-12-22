path = require('path')
fs = require('fs')
webpack = require('webpack')
sveltePreprocess = require('svelte-preprocess')
{mdsvex} = require 'mdsvex'
nodeExternals = require('webpack-node-externals')
MiniCssExtractPlugin = require('mini-css-extract-plugin')
{WebpackManifestPlugin} = require('webpack-manifest-plugin')
CopyWebpackPlugin = require("copy-webpack-plugin")
ProgressPlugin = require('progress-webpack-plugin')
{InjectManifest} = require('workbox-webpack-plugin')
{nanoid} = require('nanoid')

mode = 'none'
extensions = ['.svelte', '.mjs', '.js', '.coffee', '.md']

server = (env, args) ->
  mode = args.mode
  {
    mode
    entry: {
      Server: './src/index.js'
    }
    output:
      filename: 'index.js'
    target: 'node',
    externals: [
      # {'_http_common': 'commonjs2 _http_common'}
      # {'_dbus_next': 'commonjs2 _dbus_next'}
      # 'encoding'
      nodeExternals {
        # allowlist: ['dbus-next', 'uwrap']
        # modulesDir: '../../node_modules'
      }
    ]
    resolve: {
      extensions: [...extensions, '.hbs']
      mainFields: ['svelte', 'module', 'main']
      alias: {}
    }
    module: {
      # noParse: (content) ->
      #   content.includes '/node_modules/express'
      rules: [
        # {
        #   test: /\.m?js/
        #   resolve:
        #     fullySpecified: false
        # }
        # {
        #   test: /.(js)$/
        #   # exclude: [path.resolve(__dirname, "node_modules")]
        #   use:
        #     loader: "babel-loader"
        #     options:
        #       generatorOpts:
        #         compact: false
        #         presets: ['@babel/preset-env']
        # }
        {
          test: /.(js)$/
          use:
            loader: "babel-loader"
            # options:
            #   target: 'es2018'
        }
        {
          test: /\.coffee$/
          use: [
            {
              loader: 'coffee-loader'
              # options:
              #   transpile:
              #     presets: ['@babel/env']
            }
          ]
        }
        {
          test: /\.(svelte|svx|md)$/
          use: [
            {
              loader: 'esbuild-loader'
              options:
                target: 'es2018'
            }
            {
              loader: 'svelte-loader'
              options:
                compilerOptions:
                  generate: 'ssr'
                  hydratable: true
                  css: false
                  dev: mode isnt 'production'
                preprocess: [
                  mdsvex {
                    extensions: ['.md']
                  }
                  sveltePreprocess({
                    # babel: {
                    #   presets: [
                    #     [
                    #       '@babel/preset-env'
                    #       {
                    #         # loose: true
                    #         # No need for babel to resolve modules
                    #         modules: false
                    #         targets: {
                    #           # ! Very important. Target es6+
                    #           # esmodules: true

                    #         }
                    #       }
                    #     ]
                    #   ]
                    # }
                  })
                ]
            }
          ]
        }
        {
          # required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
          test: /node_modules\/svelte\/.*\.mjs$/,
          resolve: {
            fullySpecified: false
          }
        }
        {
          test: /\.hbs$/
          exclude: /node_modules/
          use:
            loader: 'raw-loader'
        }
        {
          test: /\.node$/
          loader: "node-loader"
        }
        {
          test: /\.(png|svg|jpg|gif|ico|webp)$/
          loader: 'file-loader'
          options: {
            name: 'public/images/[name].[contenthash].[ext]'
          }
        }
      ]
    }
    plugins: [
      new ProgressPlugin true
    ]
    ignoreWarnings: [
      {module: /express/}
    ]
  }

module.exports = {
  server
}