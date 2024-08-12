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

let imagePath = "";

// routing
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/project", renderProject);
app.get("/testimonial", renderTestimonial);
app.get("/contact", renderContact);
app.get("/detail/:blog_id", renderDetail);
app.get("/edit-project/:blog_id", renderEdit);
app.post("/edit-project/:blog_id", editProject);
app.get("/delete-project/:blog_id", deleteProject);
app.post("/create-project", upload.single("image_uploaded"), postProject);

function renderProject(req, res) {
  dbpsql.getProjects((error, results) => {
    if (error) {
      return res.status(500).send("Error retrieving projects");
    }
    res.render("project", {
      data: results,
    });
  });
}

function renderDetail(req, res) {
  // req.params.blog_id => blog_id retrieved from app.get params
  const id = parseInt(req.params.blog_id);
  dbpsql.getProjectById(id, (error, results) => {
    if (error) {
      return res.status(500).send("Error retrieving projects");
    }
    res.render("detail", {
      data: results[0],
      startDate: results[0].start_date.toISOString().split("T")[0],
      endDate: results[0].end_date.toISOString().split("T")[0],
    });
  });
}

function renderEdit(req, res) {
  const id = parseInt(req.params.blog_id);

  dbpsql.getProjectById(id, (error, results) => {
    if (error) {
      return res.status(500).send("Error retrieving projects" + error);
    }
    res.render("edit-project", {
      data: results[0],
      startDate: results[0].start_date.toISOString().split("T")[0],
      endDate: results[0].end_date.toISOString().split("T")[0],
    });
  });
}

function postProject(req, res) {
  try {
    imagePath = req.file.path.replace("views\\", "");
    const image = req.file ? imagePath : null;
    const dateDiffStart = new Date(req.body.start_date);
    const dateDiffEnd = new Date(req.body.end_date);
    console.log(`${req.body.technologies}`);

    // const techStack = req.body.technologies.split(",");
    const durationProject = `${
      (dateDiffEnd - dateDiffStart) / (24 * 3600 * 1000)
    } hari`;

    const blog = {
      title: `${req.body.title}`,
      start_date: `${req.body.start_date}`,
      end_date: `${req.body.end_date}`,
      description: `${req.body.description}`,
      technologies: req.body.technologies,
      duration: `${durationProject}`,
      image: `${image}`,
    };

    dbpsql.createProject(blog, (error, results) => {
      if (error) {
        res.status(500).send("Error creating projects");
      }
      res.redirect("/project");
    });
  } catch (e) {
    res.send(`<script>alert("Error! ${e.message}")</script>`);
  }
}

function renderTestimonial(req, res) {
  res.render("testimonial");
}

function renderContact(req, res) {
  res.render("contact");
}

function editProject(req, res) {
  try {
    const blog = {
      title: `${req.body.title}`,
      description: `${req.body.description}`,
      id: `${req.params.blog_id}`,
    };

    dbpsql.updateProject(blog, (error, results) => {
      if (error) {
        res.status(500).send("Error updating projects");
      }
      res.redirect("/project");
    });
  } catch (e) {
    res.send(`<script>alert("Error! ${e.message}")</script>`);
  }
}

function deleteProject(req, res) {
  const id = parseInt(req.params.blog_id);

  dbpsql.deleteProject(id, (error, results) => {
    if (error) {
      res.status(500).send("Error deleting projects");
    }
    res.redirect("/project");
  });
}

// function addProject(req, res) {
//   try {
//     imagePath = req.file.path.replace("views\\", "");

//     const id = blogs.length + 1;
//     const { title, description, startDate, endDate, techCheck } = req.body;
//     const image = req.file ? imagePath : null;
//     const dateDiffStart = new Date(startDate);
//     const dateDiffEnd = new Date(endDate);
//     const dayAmount = `${
//       (dateDiffEnd - dateDiffStart) / (24 * 3600 * 1000)
//     } hari`;
//     const createdAt = new Date();
//     const author = "Alfi Dharmawan";
//     const months = [
//       "Jan",
//       "Feb",
//       "Maret",
//       "April",
//       "Mei",
//       "Juni",
//       "Juli",
//       "Agust",
//       "Sept",
//       "Oct",
//       "Nov",
//       "Dec",
//     ];
//     const strDate = startDate;
//     const edDate = endDate;
//     const dateBegin = strDate.split("-"); // turn the date into a list format
//     const dateFinal = edDate.split("-"); // turn the date into a list format
//     const dateStart = `${dateBegin[2]} ${months[dateBegin[1] - 1]} ${
//       dateBegin[0]
//     }`;
//     const dateEnd = `${dateFinal[2]} ${months[dateFinal[1] - 1]} ${
//       dateFinal[0]
//     }`;

//     const blog = {
//       id,
//       title,
//       description,
//       dateStart,
//       dateEnd,
//       dayAmount,
//       image,
//       createdAt,
//       author,
//       techCheck,
//     };
//     console.log(blog);

//     blogs.unshift(blog);
//     res.redirect("/project");
//   } catch (e) {
//     res.send(`<script>alert("Error! ${e.message}")</script>`);
//     // will display blank page with 404 here, alert is temporary
//   }
// }

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
