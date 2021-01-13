#!/usr/bin/env node

const fs = require("fs");
const { assetsDir, fileSize, pkgDir } = require("./lib");
const { badgen } = require("badgen");

const pkg = require("./../package");

fs.writeFileSync(
  assetsDir("badge.style.svg"),
  badgen({
    label: "code style",
    status: "prettier",
  })
);

fs.writeFileSync(
  assetsDir("badge.license.svg"),
  badgen({
    label: "license",
    status: pkg.license,
  })
);

fs.writeFileSync(
  assetsDir("badge.npm.svg"),
  badgen({
    label: "npm",
    status: pkg.version,
  })
);

fs.writeFileSync(
  assetsDir("badge.core.size.svg"),
  badgen({
    label: "size core",
    status: fileSize(pkgDir("dist/main.js")).label,
  })
);

fs.writeFileSync(
  assetsDir("badge.react.size.svg"),
  badgen({
    label: "size react",
    status: fileSize(pkgDir("react/dist/main.js")).label,
  })
);

fs.writeFileSync(
  assetsDir("badge.time.size.svg"),
  badgen({
    label: "size time",
    status: fileSize(pkgDir("time/dist/main.js")).label,
  })
);

const getCoveragePct = function () {
  const coverage = require("./../coverage/coverage-summary");

  let pcts = [];
  for (const v of Object.values(coverage.total)) {
    if (v.total === 0) {
      continue;
    }
    pcts.push(v.pct);
  }

  return pcts.length
    ? pcts.reduce((acc, pct) => acc + pct, 0) / pcts.length
    : 100;
};

fs.writeFileSync(
  assetsDir("badge.coverage.svg"),
  badgen({
    label: "coverage",
    status: Math.round(getCoveragePct()) + "%",
  })
);
