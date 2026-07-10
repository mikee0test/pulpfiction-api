const express = require('express');
const { fetchWithBearerToken } = require('../services/authService');

const router = express.Router();

// Loads the customer's loyalty profile from an internal service using
// bearer-token auth only - never the hawk auth strategy. See authService.js.
router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || 'demo-token';
  try {
    const body = await fetchWithBearerToken('https://loyalty.example.com/profile', token);
    res.type('text').send(body);
  } catch (err) {
    res.status(502).json({ error: 'loyalty service unavailable', detail: err.message });
  }
});

module.exports = router;
