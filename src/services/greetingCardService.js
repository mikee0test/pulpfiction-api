const ejs = require('ejs');

const WELCOME_TEMPLATE = '<h1>Welcome to Pulp Fiction Smoothies, <%= name %>!</h1>';

// CVE-2022-29078 (ejs < 3.1.7): ejs.render() can lead to RCE if an attacker
// controls the *options* object passed alongside the template (e.g. via
// `options.outputFunctionName`, prototype-polluted settings, etc.).
//
// Reachability: REACHABLE but NOT EXPLOITABLE (taint-level unreachable). The
// template string and the options object are both hardcoded constants here -
// user input only ever fills a plain data value (`name`), never the options
// object - so the vulnerable branch inside ejs is never driven by attacker
// input even though the vulnerable function is genuinely called.
function renderWelcomeCard(userName) {
  return ejs.render(WELCOME_TEMPLATE, { name: userName }, { outputFunctionName: undefined });
}

module.exports = { renderWelcomeCard };
