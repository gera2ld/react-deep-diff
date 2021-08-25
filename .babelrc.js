module.exports = {
  extends: require.resolve('@gera2ld/plaid/config/babelrc-base'),
  presets: [
    '@babel/preset-react',
    ['@babel/preset-typescript', {
      isTSX: true,
      allExtensions: true,
    }],
  ],
};
