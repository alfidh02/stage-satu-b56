const express = require("express");
const app = express();
const multer = require("multer");
const port = 3000;
const path = require("path");
const dbpsql = require("./assets/js/queries");
const { start } = require("repl");

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "views/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// to access static files
app.use("/assets", express.static("assets"));
app.use("/uploads", express.static(path.join(__dirname, "views/uploads")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const blogs = [];
let imagePath = "";

// routing
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/project", renderProject);
app.post("/project", upload.single("image_uploaded"), addProject);
app.get("/testimonial", renderTestimonial);
app.get("/contact", renderContact);
app.get("/detail/:blog_id", renderDetail);
app.get("/edit-project/:blog_id", renderEdit);
app.post("/edit-project/:blog_id", editProject);
app.get("/delete-project/:blog_id", deleteProject);

// postgreSQL
app.get("/test-project", getProjects);
app.get("/test-projects", (req, res) => {
  dbpsql.getProjectsSample((error, results) => {
    if (error) {
      return res.status(500).send("Error retrieving projects");
    }
    res.render("detail-copy", {
      data: results,
    });
  });
});
app.get("/test-project/:blog_id", getProjectById);

async function getProjects(_, response) {
  dbpsql.pool.query(
    "SELECT * FROM project ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.render("detail-copy", {
        data: results.rows,
      });
    }
  );
}

async function getProjectById(request, response) {
  const id = parseInt(request.params.blog_id);

  dbpsql.pool.query(
    "SELECT * FROM project WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
}

async function getProjectsSample(request, response) {
  dbpsql.pool.query(
    "SELECT * FROM project ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.render("/");
    }
  );
}

function renderProject(req, res) {
  dbpsql.getProjectsSample((error, results) => {
    if (error) {
      return res.status(500).send("Error retrieving projects");
    }
    res.render("project", {
      data: results,
    });
  });
}

function addProject(req, res) {
  try {
    imagePath = req.file.path.replace("views\\", "");

    const id = blogs.length + 1;
    const { title, description, startDate, endDate, techCheck } = req.body;
    const image = req.file ? imagePath : null;
    const dateDiffStart = new Date(startDate);
    const dateDiffEnd = new Date(endDate);
    const dayAmount = `${
      (dateDiffEnd - dateDiffStart) / (24 * 3600 * 1000)
    } hari`;
    const createdAt = new Date();
    const author = "Alfi Dharmawan";
    const months = [
      "Jan",
      "Feb",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agust",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    const strDate = startDate;
    const edDate = endDate;
    const dateBegin = strDate.split("-"); // turn the date into a list format
    const dateFinal = edDate.split("-"); // turn the date into a list format
    const dateStart = `${dateBegin[2]} ${months[dateBegin[1] - 1]} ${
      dateBegin[0]
    }`;
    const dateEnd = `${dateFinal[2]} ${months[dateFinal[1] - 1]} ${
      dateFinal[0]
    }`;

    const blog = {
      id,
      title,
      description,
      dateStart,
      dateEnd,
      dayAmount,
      image,
      createdAt,
      author,
      techCheck,
    };
    console.log(blog);

    blogs.unshift(blog);
    res.redirect("/project");
  } catch (e) {
    res.send(`<script>alert("Error! ${e.message}")</script>`);
    // will display blank page with 404 here, alert is temporary
  }
}

function renderTestimonial(req, res) {
  res.render("testimonial");
}

function renderContact(req, res) {
  res.render("contact");
}

function renderDetail(req, res) {
  const id = req.params.blog_id;
  const blog = blogs.find((blog) => blog.id == id);

  res.render("detail", {
    data: blog,
  });
}

function renderEdit(req, res) {
  const id = req.params.blog_id;
  const blog = blogs.find((blog) => blog.id == id);

  res.render("edit-project", {
    data: blog,
  });
}

function editProject(req, res) {
  const id = req.params.blog_id;
  const index = blogs.findIndex((blog) => blog.id == id);

  const blog = {
    id: id,
    title: req.body.title,
    description: req.body.description,
    image: blogs[index].image,
    createdAt: new Date(),
    author: "Alfi Dharmawan",
  };

  blogs[index] = blog;

  res.redirect("/project");
}

function deleteProject(req, res) {
  const id = req.params.blog_id;

  const index = blogs.findIndex((blog) => blog.id == id);

  blogs.splice(index, 1);

  res.redirect("/project");
}

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
