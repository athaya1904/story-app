// webpack.config.js

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  // Menentukan mode development untuk mengaktifkan fitur-fitur webpack yang sesuai
  mode: 'development',

  // Titik masuk utama untuk aplikasi kita
  entry: './src/scripts/index.js',

  // Pengaturan output untuk file yang sudah di-bundle
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Membersihkan folder dist sebelum setiap build
  },

  // Konfigurasi untuk webpack-dev-server
  devServer: {
    static: './dist',
  },

  // Aturan untuk memproses berbagai jenis file
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'], // Memproses file CSS
      },
    ],
  },

  // Daftar plugin yang digunakan
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/icons/'),
          to: path.resolve(__dirname, 'dist/icons/'),
        },
        {
          from: path.resolve(__dirname, 'src/screenshots/'),
          to: path.resolve(__dirname, 'dist/screenshots/'),
        },
        {
          from: path.resolve(__dirname, 'src/manifest.json'),
          to: path.resolve(__dirname, 'dist/manifest.json'),
        },
      ],
    }),
    new WorkboxPlugin.GenerateSW({
      swDest: 'sw.js',
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: new RegExp('^https://story-api.dicoding.dev/'),
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'story-api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Hari
            },
          },
        },
      ],
    }),
  ],
};