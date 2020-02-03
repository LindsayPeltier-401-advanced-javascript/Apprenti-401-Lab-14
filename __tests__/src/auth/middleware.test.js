'use strict';

process.env.SECRET = 'test';

const supergoose = require('../../supergoose');
const auth = require('../../../src/auth/basicAuth');
const Users = require('../../../src/model/users-model');

let users = {
  admin: { username: 'admin', password: 'password', role: 'admin' },
  editor: { username: 'editor', password: 'password', role: 'editor' },
  user: { username: 'user', password: 'password', role: 'user' },
};

// beforeAll(async (done) => {
//   await supergoose.startDB();
//   const adminUser = await new Users(users.admin).save();
//   const editorUser = await new Users(users.editor).save();
//   const userUser = await new Users(users.user).save();
//   done();
// });

afterAll(supergoose.stopDB);

describe('Auth Middleware', () => {

  let errorObject = 'Invalid User ID/Password';

  describe('user authentication', () => {

    it('fails a login for a user (admin) with the incorrect basic credentials', () => {

      let req = {
        headers: {
          authorization: 'Basic YWRtaW46Zm9v',
        },
      };
      let res = {};
      let next = jest.fn();

      return auth(req, res, next)
        .then(() => {
          expect(next).toHaveBeenCalledWith(errorObject);
        });

    });

    xit('logs in an admin user with the right credentials', () => {

      let req = {
        headers: {
          authorization: 'Basic YWRtaW46cGFzc3dvcmQ=',
        },
      };
      let res = {};
      let next = jest.fn();

      return auth(req, res, next)
        .then(() => {
          expect(next).toHaveBeenCalledWith();
        });

    });

  });

});