const tsconfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
  baseUrl: tsconfig.compilerOptions.baseUrl,
  paths: tsconfig.compilerOptions.paths
});
