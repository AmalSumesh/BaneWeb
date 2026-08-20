const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

config.resolver.extraNodeModules = {
  "@biotech-arbitrage/types": path.resolve(monorepoRoot, "packages/types/src"),
  "@biotech-arbitrage/config": path.resolve(monorepoRoot, "packages/config/src"),
  "@biotech-arbitrage/api-client": path.resolve(monorepoRoot, "packages/api-client/src"),
};

module.exports = config;
