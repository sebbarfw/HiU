const { InjectManifest } = require('workbox-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new InjectManifest({
        swSrc: "@/worker.js",
        exclude: [
          /.*/,
        ]
      }),
    ],
  },
}
