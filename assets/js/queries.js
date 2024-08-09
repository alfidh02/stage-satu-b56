const Pool = require("pg").Pool;
const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "projectsample",
  password: "password",
  port: 5432,
});

const getProjects = (response) => {
  pool.query("SELECT * FROM project ORDER BY id ASC", (error, results) => {
    if (error) {
      throw response(error, null);
    }
    response(null, results.rows);
  });
};

const getProjectById = (id, response) => {
  // id retrieved from app.get params
  pool.query("SELECT * FROM project WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw response(error, null);
    }
    response(null, results.rows);
  });
};

module.exports = {
  getProjects,
  getProjectById,
};
