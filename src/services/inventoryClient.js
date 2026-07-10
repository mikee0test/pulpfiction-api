const axios = require('axios');

const INTERNAL_INVENTORY_URL = 'http://internal-inventory.local/api/stock';

// axios < 0.21.1 is affected by an SSRF / proxy-bypass class of issue where a
// server redirect can steer a request to an attacker-influenced destination.
//
// Reachability: REACHABLE but NOT EXPLOITABLE (taint-level unreachable). The
// destination URL is a hardcoded internal constant - never derived from
// request input - so there is no attacker-controlled path into the
// vulnerable redirect-handling behavior, even though axios.get() genuinely
// executes.
async function getStockLevels() {
  try {
    const response = await axios.get(INTERNAL_INVENTORY_URL, { timeout: 500 });
    return response.data;
  } catch (err) {
    // Best-effort: inventory service may not be reachable in this test fixture.
    return { juice: 'unknown', mango: 'unknown' };
  }
}

module.exports = { getStockLevels };
