require('dotenv').config();
const database = require('./src/config/database');
const express = require('express');
const Routes = require('./src/config/routes');

database.authenticate();

let app = express();
app.use(express.json());
Routes(app);

database.sync({ alter: true });
app.listen(3000);
