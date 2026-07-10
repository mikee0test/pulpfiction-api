const _ = require('lodash');

// CVE-2021-23337 (lodash < 4.17.21): _.template() can be abused for command
// injection when the template string itself is attacker-controlled, because the
// compiled function is built with `Function()` under the hood.
//
// Reachability: REACHABLE + EXPLOITABLE. The recipe text passed in here comes
// straight from an HTTP request body (see routes/recipes.js) with no
// sanitization, so tainted user input flows directly into the vulnerable sink.
function renderRecipe(recipeTemplate) {
  const compiled = _.template(recipeTemplate);
  return compiled({});
}

module.exports = { renderRecipe };
