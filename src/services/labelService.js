const _ = require('lodash');

// CVE-2020-8203 (lodash < 4.17.19): _.zipObjectDeep() is vulnerable to prototype
// pollution via a crafted `keys` array (e.g. "__proto__.polluted").
//
// Reachability: UNREACHABLE. This module is required by src/index.js so the
// package/module shows up in a naive import graph, but buildNestedLabel() is
// never actually invoked anywhere in the app - dead code. Same package
// (lodash) as templateService.js, different function, different CVE, and a
// different reachability verdict.
function buildNestedLabel(keys, values) {
  return _.zipObjectDeep(keys, values);
}

module.exports = { buildNestedLabel };
