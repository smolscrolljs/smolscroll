#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir, proxyTypes } = require("./lib");

(async () => {
  const moduleName = "time";
  await rmDir(pkgDir(moduleName, "dist"), { recursive: true });
  spawn("npx", ["microbundle", "--cwd", moduleName, ...buildArgs(), ...args]);
  await proxyTypes(moduleName);
})();
