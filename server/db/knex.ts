import * as KnexConnector from 'knex';

const env = process.env.NODE_ENV || 'dev';
const config = require('./knexfile.js')[env];
const knex = KnexConnector(config);

export default knex;
