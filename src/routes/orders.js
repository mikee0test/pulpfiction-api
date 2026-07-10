const express = require('express');
const { fetchWithUpstreamCookie } = require('../services/legacyFetcher');

const router = express.Router();

// Fetches order status from a legacy fulfillment partner, forwarding along
// whatever Cookie header the caller sent us. See legacyFetcher.js - this is
// the code path that drives request()'s tough-cookie jar with tainted input.
router.get('/orders/:id/legacy-status', async (req, res) => {
  const partnerUrl = `https://legacy-fulfillment.example.com/orders/${req.params.id}`;
  try {
    const body = await fetchWithUpstreamCookie(partnerUrl, req.headers.cookie || '');
    res.type('text').send(body);
  } catch (err) {
    res.status(502).json({ error: 'legacy fulfillment partner unavailable', detail: err.message });
  }
});

module.exports = router;
