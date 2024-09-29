const express = require('express');
const routes = require('./routes');

const app = express();

/**
 * Env variable or port 5000 if not set
 */
const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/**
 * Exporting the app module
 */
module.exports = app;
