const browserSync = require('rollup-plugin-browsersync');

function browserSyncPlugin({
  dist,
}) {
  return browserSync({
    server: dist,
    notify: false,
    open: false,
  });
}

exports.browserSyncPlugin = browserSyncPlugin;
