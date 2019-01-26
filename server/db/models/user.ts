import * as crypto from 'crypto';
import * as Promise from 'bluebird';
import { first, omit } from 'lodash';
import knex from '../knex';
import M from './types';

export type Credentials = {
  email?: string;
  password?: string;
};

const reject = (msg: string) => Promise.reject(new Error(msg));

const User = () => knex('users');

const makeSalt = (num = 20) => {
  return crypto.randomBytes(num).toString('hex');
};

const getHashed = (password: string, salt: string) => {
  return crypto
    .createHmac('sha512', salt)
    .update(password)
    .digest('hex');
};

const verifyPassword = (password: string, salt: string, hashed: string) => {
  return getHashed(password, salt) === hashed;
};

const isValidUser = (user: M.User, password: string) => {
  if (!user) throw new Error(`Invalid user ${user}!`);

  const { salt, password: hashed } = user;
  const isValid = verifyPassword(password, salt, hashed);

  return isValid;
};

const verifyUser = (user: M.User, password: string) => {
  if (isValidUser(user, password)) {
    return user;
  } else {
    throw new Error('Invalid password!');
  }
};

const formatted = (user: M.User): M.User => omit(user, ['password', 'salt']);

const sanitized = (params: M.User) => {
  const { password } = params;
  const salt = makeSalt();

  return Object.assign({}, params, {
    salt,
    password: getHashed(password, salt)
  });
};

const fetch = (where: any = {}) => {
  return User()
    .select()
    .where(where);
};

const findOne = (where: any = {}) => {
  return fetch(where).first();
};

const findById = (id: number) => {
  return findOne({ id });
};

const findByEmail = (email: string) => {
  return findOne({ email }).then(user => user);
};

const create = (params: any) => {
  return User()
    .returning('id')
    .insert(sanitized(params))
    .then(first)
    .then(findById);
};

const register = ({ email, password }: Credentials) => {
  if (!email) return reject('Email is required!');
  if (!password) return reject('Password is required!');

  return findByEmail(email)
    .then(existing => {
      if (existing) throw new Error('That email address is taken!');

      return create({ email, password });
    })
    .then(user => formatted(user));
};

const addCredit = (id: number, credits: number) => {
  return findById(id)
    .increment('credits', credits)
    .then(() => findById(id));
};

const authenticate = ({ email, password }: Credentials) => {
  if (!email) return reject('Email is required!');
  if (!password) return reject('Password is required!');

  return findByEmail(email)
    .then(user => verifyUser(user, password))
    .then(user => formatted(user));
};

export default {
  addCredit,
  fetch,
  findOne,
  findById,
  findByEmail,
  create,
  register,
  authenticate,
  verifyUser
};
