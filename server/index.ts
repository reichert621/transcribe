import * as express from 'express';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
import * as cors from 'cors';
import { build, port, secret } from './config';
import template from './template';
import knex from './db/knex';
import api from './api';

const KnexSessionStore = require('connect-session-knex')(session);
const app = express();

app.use(cors());
app.use(express.static(build));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    store: new KnexSessionStore({ knex })
  })
);

const { strategy, serialize, deserialize } = require('./passport');

passport.use(strategy);
passport.serializeUser(serialize);
passport.deserializeUser(deserialize);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api);
app.get('*', (req, res) => res.send(template()));

app.listen(port, () => console.log(`Listening on port ${port}`));
