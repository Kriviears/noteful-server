'use strict';

const express = require('express');
const { NODE_ENV } = require('./config');
const app = express();

const errorHandler = function errorHandler(error, req, res, next){
  let response;
  if(NODE_ENV === 'production'){
    response = { error: { message: 'server error'} };
  } else {
    console.error(error);
    response = { message: error.message, error};
  }
  res.status(500).json(response);
};

module.exports = { errorHandler, };