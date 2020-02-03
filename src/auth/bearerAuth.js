'use strict';
const User = require('../model/users-model');
/** 
 * @module BearerAuth
*/
module.exports = (request, response, next) => {

  if (!request.headers.authorization) { next('Invalid Login'); return; }

  let token = request.headers.authorization.split(' ').pop();

  User
    .authenticateToken(token)
    .then(validUser => {
      request.user = validUser;
      next();
    })
    .catch(err => next('Unauthorized Token'));

};