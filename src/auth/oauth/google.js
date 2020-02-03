'use strict';

const superagent = require('superagent');
const Users = require('../../model/users-model');

const authorize = (req) => {

  let code = req.query.code;
  console.log('(1) CODE:', code);

  return superagent.post('https://oauth2.googleapis.com/token')
    .type('form')
    .send({
      code: code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT,
      grant_type: 'authorization_code',
    })
    .then(response => {
      let access_token = response.body.access_token;
      console.log('(2) ACCESS TOKEN:', access_token);
      return access_token;
    })
    .then(token => {
      return superagent.get('https://openidconnect.googleapis.com/v1/userinfo')
        .set('Authorization', `Bearer ${token}`)
        .then(response => {
          let user = response.body;
          user.access_token = token;
          console.log('(3) GOOGLEUSER', user);
          return user;
        });
    })
    .then(oauthUser => {
      console.log('(4) CREATE ACCOUNT');
      return Users.createFromOAuth(oauthUser);
    })
    .then(actualRealUser => {
      console.log('(5) ALMOST ...', actualRealUser);
      return actualRealUser.generateToken();
    })
    .catch(error => error);


};

module.exports = { authorize };