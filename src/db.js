require("dotenv").config();
import { Sequelize } from "sequelize";
import { production, development } from "../config/config.js";
const envConfig =
  process.env.NODE_ENV === "production" ? production : development;

const db = new Sequelize({
  ...envConfig,
  dialectModule: require("pg"),
});

export default db;
