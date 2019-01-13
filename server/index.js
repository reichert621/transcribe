const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const { build, port } = require('./config');
const template = require('./template');
const api = require('./api');

const app = express();

app.use(cors());
app.use(express.static(build));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Placeholder
const home = (req, res) => res.send(template());

app.use('/api', api);
app.get('*', home);

app.listen(port, () => console.log(`Listening on port ${port}`));
