'use strict';

process.env.SECRET = 'Donttellitssecret';

const jwt = require('jsonwebtoken');
const { server } = require('../../../src/app');
const supergoose = require('@code-fellows/supergoose');
const mockRequest = supergoose(server);


describe('Auth Router', () => {
  let testUser = {
    username: 'test',
    password: 'pass',
  };

  xit('can create a user', () => {
    return mockRequest.post('/signup')
      .send(testUser)
      .then(data => {
        let token = jwt.verify(data.text, process.env.SECRET);
        expect(token).toBeDefined();
      });
  });
  xit('returns all users', () => {
    return mockRequest.get('/users')
      .then(data => {
        expect(data.body.count).toEqual(1);
      });
  });
  xit('signs in a user', () => {
    return mockRequest.post('/signin')
      .auth(testUser.username, testUser.password)
      .then(data => {
        let token = jwt.verify(data.text, process.env.SECRET);
        expect(token).toBeDefined();
      });
  });
  it('returns invalid on sign in if password is wrong', () => {
    return mockRequest.post('/signin')
      .auth(testUser.username, 'wrongpassword')
      .then(data => {
        expect(data.status).toBe(500);
      });
  });
  it('should give 404 error on bad route', () => {
    return mockRequest.get('/wrong')
      .then(result => {
        expect(result.status).toBe(404);
      });
  });
});