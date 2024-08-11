const Pool = require("pg").Pool;
const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "projectsample",
  password: "password",
  port: 5432,
});

const getProjects = (response) => {
  pool.query("SELECT * FROM projectdumb ORDER BY id ASC", (error, results) => {
    if (error) {
      throw response(error, null);
    }
    response(null, results.rows);
  });
};

const getProjectById = (id, response) => {
  pool.query(
    "SELECT * FROM projectdumb WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw response(error, null);
      }
      response(null, results.rows);
    }
  );
};

const createProject = (request, response) => {
  // const { title, start_date, end_date, description, technologies, image } =
  //   request.body;
  pool.query(
    `INSERT INTO projectdumb (title, start_date, end_date, description, technologies, image, created_date, author) VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'Alfi Dharmawan')`,
    [
      request.title,
      request.start_date,
      request.end_date,
      request.description,
      request.technologies,
      request.image,
    ],
    (error, results) => {
      if (error) {
        throw response(error, null);
      }
      response(null, results.rows);
    }
  );
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
};
