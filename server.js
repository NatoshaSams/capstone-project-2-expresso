//Mod and MW require
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const express = require('express');

//Declare API router
const apiRouter = require('./api/api');

//Declares instance of express
const app = express();
const PORT = process.env.PORT || 4000;

//Declare MW
app.use(bodyParser.json());
app.use(cors());

app.use('/api', apiRouter);

//Sends errors to client
app.use(errorhandler());

//Server listening
app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});

module.exports = app;
