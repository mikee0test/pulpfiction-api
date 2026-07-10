# 🥤 Pulp Fiction API

*"You will know we take our smoothies very, very seriously."*

A smoothie-ordering API with a rap sheet of npm CVEs baked in.

This is a **deliberately vulnerable** Node/Express test fixture, built to exercise
SCA (Software Composition Analysis) tools that do **reachability analysis** -
i.e. that try to tell "this vulnerable package is in the tree" apart from
"this vulnerable *function* is actually called, possibly with attacker-controlled
input."

It is not a real product. Do not deploy it, do not expose it to the internet,
and do not `npm install` these versions into anything you care about.

## Layout

```
src/
  index.js                    entrypoint, wires up all routes
  routes/
    recipes.js                POST /recipes/render, POST /welcome
    menu.js                   GET  /menu
    orders.js                 GET  /orders/:id/legacy-status
    profile.js                GET  /profile
  services/
    templateService.js        lodash _.template()      - reachable + exploitable
    labelService.js            lodash _.zipObjectDeep()  - unreachable (dead code)
    greetingCardService.js    ejs.render()              - reachable, not exploitable
    inventoryClient.js        axios.get()               - reachable, not exploitable
    legacyFetcher.js          request + tough-cookie     - reachable (transitive, depth 2)
    authService.js            request + http-signature   - unreachable (transitive, depth 4)
```

## Reachability matrix

| # | Package (version)              | CVE                | Depth in tree                | Called by app code? | Attacker-controlled input? | Verdict |
|---|--------------------------------|---------------------|-------------------------------|----------------------|------------------------------|---------|
| 1 | `lodash@4.17.15`                | CVE-2021-23337 (command injection in `_.template`) | 1 (direct) | Yes - `templateService.renderRecipe` | Yes - HTTP body `recipeTemplate` | **Reachable & exploitable** |
| 2 | `lodash@4.17.15`                | CVE-2020-8203 (prototype pollution in `_.zipObjectDeep`) | 1 (direct) | No - `labelService.buildNestedLabel` is imported but never invoked | n/a | **Unreachable (dead code)** |
| 3 | `ejs@3.1.6`                      | CVE-2022-29078 (RCE via crafted `options`) | 1 (direct) | Yes - `greetingCardService.renderWelcomeCard` | No - template & options are hardcoded constants, only a data value is user-supplied | **Reachable, not exploitable (taint-blocked)** |
| 4 | `axios@0.21.1`                  | SSRF / redirect-handling issue (fixed in 0.21.2) | 1 (direct) | Yes - `inventoryClient.getStockLevels` | No - destination URL is a hardcoded constant | **Reachable, not exploitable (taint-blocked)** |
| 5 | `tough-cookie@2.5.0` (via `request@2.88.2`) | CVE-2023-26136 (prototype pollution parsing cookies, fixed in 4.1.3) | 2 (transitive) | Yes - `legacyFetcher.fetchWithUpstreamCookie` uses `request({ jar: true, headers: { Cookie } })`, driving `request`'s internal CookieJar into tough-cookie | Yes - forwards the inbound `Cookie` header from `GET /orders/:id/legacy-status` | **Reachable (transitive), exploitable** |
| 6 | `sshpk@1.13.1` (via `request@2.88.2` -> `http-signature@1.2.0` -> `sshpk`, pinned with an `overrides` entry) | CVE-2018-3737 (ReDoS parsing a crafted public key, fixed in 1.13.2) | 4 (transitive) | No - `authService.fetchWithBearerToken` only ever passes `auth: { bearer }`, never `httpSignature`, so `http-signature`'s code (and sshpk beneath it) never runs | n/a | **Unreachable (dead branch, deep in tree)** |

## Why this shape

- Rows 1 vs 2 isolate **function-level** precision within the *same* direct
  dependency: two CVEs in `lodash@4.17.15`, one on a called function, one on
  a dead one.
- Rows 3 vs 4 add **taint-level** nuance: the vulnerable function is genuinely
  invoked, but only with developer-controlled constants, so a tool that stops
  at "is the sink called" (vs. "is the sink called with tainted input") will
  over-report these as exploitable.
- Rows 5 vs 6 push reachability into **transitive** dependencies at depth 2
  and depth 4, one live and driven by request input, the other a dead branch
  that never executes because the app never selects that auth strategy.
  `sshpk` only ends up vulnerable at all because of the `overrides` entry in
  `package.json` - `request@2.88.2`'s own dependency chain would otherwise
  resolve a patched version.

## Running it

```bash
npm install     # generates package-lock.json with the full (vulnerable) tree
npm start       # listens on :3000
```

Point your SCA / reachability tool at this directory (or just run `npm ls --all`
to see the raw dependency tree) after `npm install`.
