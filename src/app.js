'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { errorHandler } = require('./validators');
const folderRouter = require('./folders/folders-router');
const noteRouter = require('./notes/notes-router');


const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());



app.get('/', (req, res)=>{
  res.send('Noteful app');
});

app.use('/api/notes', noteRouter);
app.use('/api/folders', folderRouter);

app.use(errorHandler);

module.exports = app;