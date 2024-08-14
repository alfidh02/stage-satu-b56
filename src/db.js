const { Sequelize } = require("sequelize");

const db = new Sequelize({
  username: "me",
  host: "localhost",
  dialect: "postgres",
  database: "projectsample",
  password: "password",
  port: 5432,
  schema: "public",
});

module.exports = db;
