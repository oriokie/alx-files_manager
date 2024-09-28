const express = require('express');
const routes = require('./routes')

const app = express();
const port = process.env.port;

app.use(express.json());
app.use('/', routes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
