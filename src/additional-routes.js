'use strict';

const express = require('express');
const router = express.Router();
const Roles = require('./model/roles-model');
const bearerAuth = require('./auth/bearerAuth');
const acl = require('./auth/acl-middleware');

const capabilities = {
  admin: ['create', 'read', 'update', 'delete', 'superuser'],
  editor: ['create', 'read', 'update'],
  user: ['read'],
};

router.post('/roles', (req, res, next) => {
  let roleArr = [];
  Object.keys(capabilities).map(role => {
    let rolesRecord = new Roles({ type: role, capabilities: capabilities[role] });
    roleArr.push(rolesRecord.save());
  });
  Promise.all(roleArr);
  res.send('roles saved');
});

router.get('/public');

router.get('/private', bearerAuth, (req, res, next) => {
  res.send('OK');
});

router.get('/readonly', bearerAuth, acl('read'), (req, res, next) => {
  res.send('OK');
});

router.get('/create', bearerAuth, acl('create'), (req, res, next) => {
  res.send('OK');
});

router.post('/update', bearerAuth, acl('update'), (req, res, next) => {
  res.send('OK');
});

router.patch('/delete', bearerAuth, acl('delete'), (req, res, next) => {
  res.send('OK');
});

router.get('/everything', bearerAuth, acl('superuser'), (req, res, next) => {
  res.send('OK');
});

module.exports = router;