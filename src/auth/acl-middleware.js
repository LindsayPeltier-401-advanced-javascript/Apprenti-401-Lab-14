'use strict';

/** 
 * @module aclMiddleware
*/
module.exports = (capabilities) => {
  return (request, response, next) => {
    try {
      if (request.user.capabilities.includes(capabilities)) {
        next();
      }
      else {
        next('access denied');
      }
    }
    catch (error) {
      next('invalid login');
    }
  };
};