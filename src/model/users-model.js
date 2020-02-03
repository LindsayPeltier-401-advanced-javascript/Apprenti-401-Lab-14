'use strict';

require('dotenv').config('../.env');
require('./roles-model');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let usedTokens = new Set();

let capabilities = {
  user: ['read'],
  editor: ['read', 'create', 'update'],
  admin: ['read', 'create', 'update', 'delete'],
};

const users = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, default: 'user', enum: ['admin', 'editor', 'user'] },
}, { toObject: { virtuals: true }, toJSON: { virtuals: true } });

users.virtual('userRole', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'type',
  justOne: false,
});

users.pre('findOne', async function () {
  try {
    this.populate('userRole');
  }
  catch (error) {
    console.error('find error', error);
  }
});

users.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
/** 
 * @method createFromOAuth
*/
users.statics.createFromOAuth = function (oauthUser) {
  console.log('user', oauthUser);

  if (!oauthUser) { return Promise.reject('Validation Error'); }

  return this.findOne({ email: `${oauthUser.email}` })
    .then(user => {
      if (!user) { throw new Error('User Not Found'); }
      console.log('Welcome Back', user.username);
      return user;
    })
    .catch(error => {
      console.log('Creating new user');
      let username = oauthUser.email;
      let password = 'none';
      let email = oauthUser.email;
      return this.create({ username, password, email });
    });
};
/** 
 * @method authenticateToken
*/
users.statics.authenticateToken = function (token) {

  if ((process.env.SINGLE_USE_TOKENS === 'true') && usedTokens.has(token)) {
    console.log('nope');
    return Promise.reject('invalid token');
  }
  let parsedToken = jwt.verify(token, process.env.SECRET);
  usedTokens.add(token);

  let query = { _id: parsedToken.id };
  return this.findOne(query);
};
/** 
 * @method authenticateBasic
*/
users.statics.authenticateBasic = function (auth) {
  let query = { username: auth.username };
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(error => { throw error; });
};
/** 
 * @method comparePassword
*/
users.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};
/** 
 * @method generateToken
*/
users.methods.generateToken = function () {

  let token = {
    id: this._id,
    capabilities: capabilities[this.role],
    role: this.role,
  };

  return jwt.sign(token, process.env.SECRET, { expiresIn: process.env.TOKEN_EXPIRES });
};
/** 
 * @module User
*/
module.exports = mongoose.model('users', users);