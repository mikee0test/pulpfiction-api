const request = require('request');

// `request` also depends on `hawk` (which in turn depends on hoek / boom /
// cryptiles / sntp) to support Hawk-scheme authentication. That whole
// sub-tree has its own history of prototype-pollution style CVEs.
//
// Reachability: UNREACHABLE, three-plus levels deep. hawk's code only runs
// when `auth: { hawk: true, ... }` (or an equivalent Hawk credentials object)
// is passed to request(). This app only ever authenticates with a bearer
// token, so hawk - and everything beneath it - sits in node_modules but is
// never executed by any code path in this repo.
function fetchWithBearerToken(url, token) {
  return new Promise((resolve, reject) => {
    request(
      {
        url,
        auth: { bearer: token },
      },
      (err, response, body) => {
        if (err) return reject(err);
        resolve(body);
      }
    );
  });
}

module.exports = { fetchWithBearerToken };
