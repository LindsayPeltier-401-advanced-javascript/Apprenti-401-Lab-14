'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Esoteric Resources
const errorHandler = require('./middleware/500');
const notFound = require('./middleware/404.js');
const authRouter = require('./router');
const additionalRouter = require('./additional-routes');

// swagger
const swaggerUi = require('swagger-ui-express');
//const swaggerDocument = require('../docs/config/swagger.json');

// Prepare the express app
const app = express();

// App Level MW
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/docs', express.static('docs'));
app.use(express.static('public'));
app.use(authRouter);
app.use(additionalRouter);
app.use('/api-docs', swaggerUi.serve);
//app.get('/api-docs', swaggerUi.setup(swaggerDocument));

// Catchalls
app.use(notFound);
app.use(errorHandler);

module.exports = {
  server: app,
  start: (port) => {
    app.listen(port, () => {
      console.log(`Server Up on ${port}`);
    });
  },
};