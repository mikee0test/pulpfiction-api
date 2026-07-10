const express = require('express');

// Imported so the module shows up in a static import graph, but
// labelService.buildNestedLabel() is never called anywhere - see
// services/labelService.js for the reachability note.
require('./services/labelService');

const menuRoutes = require('./routes/menu');
const recipeRoutes = require('./routes/recipes');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');

const app = express();
app.use(express.json());

app.use(menuRoutes);
app.use(recipeRoutes);
app.use(orderRoutes);
app.use(profileRoutes);

app.get('/', (req, res) => {
  res.json({ name: 'pulpfiction-api', tagline: 'You will know we take our smoothies very, very seriously.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`pulpfiction-api listening on port ${PORT}`);
});

module.exports = app;
