const express = require('express');
const { getStockLevels } = require('../services/inventoryClient');

const router = express.Router();

router.get('/menu', async (req, res) => {
  const stock = await getStockLevels();
  res.json({
    menu: ['Mango Tango', 'Green Machine', 'Berry Blast'],
    stock,
  });
});

module.exports = router;
