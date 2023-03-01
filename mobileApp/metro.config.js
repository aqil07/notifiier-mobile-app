/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        __DEV__:true,
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
