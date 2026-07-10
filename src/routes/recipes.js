const express = require('express');
const { renderRecipe } = require('../services/templateService');
const { renderWelcomeCard } = require('../services/greetingCardService');

const router = express.Router();

// Renders a customer-supplied recipe "card" - the recipeTemplate string is
// compiled directly with lodash's _.template(). See templateService.js.
router.post('/recipes/render', (req, res) => {
  const { recipeTemplate } = req.body;
  try {
    const html = renderRecipe(recipeTemplate);
    res.type('html').send(html);
  } catch (err) {
    res.status(400).json({ error: 'could not render recipe', detail: err.message });
  }
});

// Renders a static welcome card for a named customer. See greetingCardService.js.
router.post('/welcome', (req, res) => {
  const { name } = req.body;
  const html = renderWelcomeCard(name);
  res.type('html').send(html);
});

module.exports = router;
