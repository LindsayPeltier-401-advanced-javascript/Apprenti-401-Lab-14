'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./model/users-model');
const auth = require('./auth/basicAuth');
const oauth = require('./auth/oauth/google');
const bearerAuth = require('./auth/bearerAuth');

authRouter.get('/users', (request, response, next) => {
  User.find({})
    .then(results => {
      const data = {
        count: results.length,
        results: results,
      };
      response.json(data);
    });
});

authRouter.post('/signup', (request, response, next) => {
  let user = new User(request.body);
  user.save()
    .then((user) => {
      request.token = user.generateToken();
      request.user = user;
      response.set('token', request.token);
      response.cookie('auth', request.token);
      response.send(request.token);
    }).catch(next);
});

authRouter.post('/signin', auth, (request, response, next) => {
  response.cookie('auth', request.token);
  response.send(request.token);
});

authRouter.get('/user', bearerAuth, (request, response, next) => {
  response.status(200).json(request.user);
});

authRouter.get('/oauth', (request, response, next) => {
  oauth.authorize(request)
    .then(token => {
      response.status(200).send(token);
    })
    .catch(next);
});


module.exports = authRouter;