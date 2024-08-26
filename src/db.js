require("dotenv").config();

const { Sequelize } = require("sequelize");
const config = require("../config/config.js");
const envConfig =
  process.env.NODE_ENV === "production"
    ? config.production
    : config.development;

const db = new Sequelize({
  ...envConfig,
  dialectModule: require("pg"),
});

module.exports = db;
