const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
  ? '/tuckermouse-museum/' //github pages subpath，https://maygoat.github.io/tuckermouse-museum/
  : '/'
})
