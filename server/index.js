const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
const { build, port, secret } = require('./config');
const template = require('./template');
const api = require('./api');

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
    }
  })
);

const { strategy, serialize, deserialize } = require('./passport');

passport.use(strategy);
passport.serializeUser(serialize);
passport.deserializeUser(deserialize);

app.use(passport.initialize());
app.use(passport.session());

// Placeholder
const home = (req, res) => res.send(template());

app.use('/api', api);
app.get('*', home);

app.listen(port, () => console.log(`Listening on port ${port}`));
