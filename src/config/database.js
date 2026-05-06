const { Sequelize } = require('sequelize')

const { DB_ADAPTOR, DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_DATABASE } = process.env;

const URI = `${DB_ADAPTOR}://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`

const connection = new Sequelize(URI, {})



module.exports = connection