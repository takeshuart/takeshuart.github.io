"use strict";

var _require = require('@vue/cli-service'),
    defineConfig = _require.defineConfig;

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? '/' //github pages subpath，https://maygoat.github.io/tuckermouse-museum/
  : '/'
});