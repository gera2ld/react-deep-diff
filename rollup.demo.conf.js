const { terser } = require('rollup-plugin-terser');
const {
  defaultOptions,
  getRollupPlugins,
  isProd,
  loadConfigSync,
} = require('@gera2ld/plaid');
const { browserSyncPlugin } = require('./scripts/browser-sync');

const DIST = 'dist-demo';
const FILENAME = 'app';

const postcssConfig = loadConfigSync('postcss') || require('@gera2ld/plaid/config/postcssrc');
const postcssOptions = {
  ...postcssConfig,
  extract: true,
};

const rollupConfig = [
  {
    input: {
      input: 'demo/index.tsx',
      plugins: [
        ...getRollupPlugins({
          esm: true,
          extensions: defaultOptions.extensions,
          postcss: postcssOptions,
        }),
        isProd && terser(),
        !isProd && browserSyncPlugin({ dist: DIST }),
      ].filter(Boolean),
    },
    output: {
      format: 'iife',
      file: `${DIST}/${FILENAME}.js`,
    },
  },
];

rollupConfig.forEach((item) => {
  item.output = {
    indent: false,
    // If set to false, circular dependencies and live bindings for external imports won't work
    externalLiveBindings: false,
    ...item.output,
  };
});

module.exports = rollupConfig.map(({ input, output }) => ({
  ...input,
  output,
}));
