const request = require('request');

// CVE-2023-26136 (tough-cookie < 4.1.3, pulled in transitively via `request`
// -> `request-promise` chain / cookie jar support): parsing a maliciously
// crafted cookie string can lead to prototype pollution.
//
// Reachability: REACHABLE, two levels deep. `request` is our direct
// dependency; tough-cookie is a *transitive* dependency of `request` that we
// never import ourselves. But by calling request() with `jar: true` and
// forwarding an upstream, attacker-influenced Cookie header, we drive
// request's internal CookieJar straight into tough-cookie's vulnerable
// parsing code - a genuine transitive-dependency reachability case.
function fetchWithUpstreamCookie(url, upstreamCookieHeader) {
  return new Promise((resolve, reject) => {
    request(
      {
        url,
        jar: true,
        headers: {
          Cookie: upstreamCookieHeader, // attacker-influenced value from an upstream response
        },
      },
      (err, response, body) => {
        if (err) return reject(err);
        resolve(body);
      }
    );
  });
}

module.exports = { fetchWithUpstreamCookie };
