'use strict';

const User = require('../model/users-model');
/** 
 * @module BasicAuth
*/
module.exports = (req, res, next) => {

  try {
    let [authType, authString] = req.headers.authorization.split(/\s+/);

    switch (authType.toLowerCase()) {
      case 'basic':
        return _authBasic(authString);
      default:
        return _authError();
    }
  }
  catch (e) {
    next(e);
  }

  /**
   *
   *
   * @param {*} str
   * @returns user with token
   */
  function _authBasic(str) {
    let base64Buffer = Buffer.from(str, 'base64');
    let bufferString = base64Buffer.toString();
    let [username, password] = bufferString.split(':');
    let auth = { username, password };

    return User.authenticateBasic(auth)
      .then(user => _authenticate(user))
      .catch(next);
  }
  /**
 *
 *
 * @param {*} user
 */
  function _authenticate(user) {
    if (user) {
      req.user = user;
      req.token = user.generateToken();
      next();
    }
    else {
      _authError();
    }
  }
  /**
   *
   * @function authError
   */
  function _authError() {
    next('Invalid User ID/Password');
  }

};