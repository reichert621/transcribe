const crypto = require('crypto');
const { first, omit } = require('lodash');
const knex = require('../knex.js');

const reject = msg => Promise.reject(new Error(msg));

const User = () => knex('users');

const makeSalt = (num = 20) => {
  return crypto.randomBytes(num).toString('hex');
};

const getHashed = (password, salt) => {
  return crypto
    .createHmac('sha512', salt)
    .update(password)
    .digest('hex');
};

const verifyPassword = (password, salt, hashed) => {
  return getHashed(password, salt) === hashed;
};

const isValidUser = (user, password) => {
  if (!user) throw new Error(`Invalid user ${user}!`);

  const { salt, password: hashed } = user;
  const isValid = verifyPassword(password, salt, hashed);

  return isValid;
};

const verifyUser = (user, password) => {
  if (isValidUser(user, password)) {
    return user;
  } else {
    throw new Error('Invalid password!');
  }
};

const formatted = user => omit(user, ['password', 'salt']);

const sanitized = params => {
  const { password } = params;
  const salt = makeSalt();

  return Object.assign({}, params, {
    salt,
    password: getHashed(password, salt)
  });
};

const fetch = (where = {}) => {
  return User()
    .select()
    .where(where);
};

const findOne = where => {
  return fetch(where).first();
};

const findById = id => {
  return findOne({ id });
};

const findByEmail = email => {
  return findOne({ email });
};

const create = params => {
  return User()
    .returning('id')
    .insert(sanitized(params))
    .then(first)
    .then(findById);
};

const register = params => {
  const { email, password } = params;

  if (!email) return reject('Email is required!');
  if (!password) return reject('Password is required!');

  return findByEmail(email).then(existing => {
    if (existing) throw new Error('That email address is taken!');

    return create(params).then(user => formatted(user));
  });
};

const authenticate = ({ email, password }) => {
  return findByEmail(email)
    .then(user => verifyUser(user, password))
    .then(user => formatted(user));
};

module.exports = {
  fetch,
  findOne,
  findById,
  findByEmail,
  create,
  register,
  authenticate,
  verifyUser
};
