const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ignore Firebase's temporary build directories that Metro's FallbackWatcher
// cannot handle (they are created then immediately deleted during pnpm build)
config.resolver.blockList = /_tmp_\d+/;

module.exports = config;
