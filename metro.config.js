const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// On web, replace react-native-track-player with a no-op mock
const originalResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === 'react-native-track-player') {
      return {
        filePath: path.resolve(__dirname, 'src/mocks/react-native-track-player.ts'),
        type: 'sourceFile',
      };
    }
  }
  // Fall through to default resolver
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
