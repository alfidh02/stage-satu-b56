const Pool = require("pg").Pool;
const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "projectsample",
  password: "password",
  port: 5432,
});

const getProjects = (request, response) => {
  pool.query("SELECT * FROM project ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getProjectById = (request, response) => {
  const id = parseInt(request.params.blog_id);

  pool.query("SELECT * FROM project WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

module.exports = {
  getProjects,
  getProjectById,
};