const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const db = require("./src/db");
const { QueryTypes } = require("sequelize");
const session = require("express-session");
const flash = require("express-flash");

require("dotenv").config();
const port = process.env.PORT || 5000;

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "views/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

// to access static files
app.use("/assets", express.static("assets"));
app.use("/uploads", express.static(path.join(__dirname, "views/uploads")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let imagePath = "";

app.use(
  session({
    secret: "johndoesession",
    cookie: { maxAge: 3600000, secure: false, httpOnly: true },
    saveUninitialized: true,
    resave: false,
    store: new session.MemoryStore(),
  })
);

app.use(flash());

// routing
app.get("/", renderHome);
app.get("/project", renderProject);
app.get("/testimonial", renderTestimonial);
app.get("/contact", renderContact);
app.get("/detail/:blog_id", renderDetail);
app.get("/edit-project/:blog_id", renderEdit);
app.post("/edit-project/:blog_id", editProject);
app.get("/delete-project/:blog_id", deleteProject);
app.post("/create-project", upload.single("image_uploaded"), postProject);
app.get("/login", renderLogin);
app.post("/login", login);
app.get("/register", renderRegister);
app.post("/register", register);
app.get("/logout", logout);

function renderHome(req, res) {
  const loggedIn = req.session.loggedIn;

  res.render("index", {
    loggedIn: loggedIn,
  });
}

async function renderProject(req, res) {
  try {
    const loggedIn = req.session.loggedIn;

    const project = `SELECT * FROM projectdumb ORDER BY id ASC`;
    const results = await db.query(project, { type: QueryTypes.SELECT });

    res.render("project", {
      data: results,
      loggedIn: loggedIn,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error in render process :", error);
    res.status(500).send("Error retrieving projects");
  }
}

async function renderDetail(req, res) {
  // req.params.blog_id => blog_id retrieved from app.get params
  try {
    const loggedIn = req.session.loggedIn;
    if (loggedIn) {
      const id = parseInt(req.params.blog_id);
      const project = `SELECT * FROM projectdumb WHERE id = $1`;
      const result = await db.query(project, {
        type: QueryTypes.SELECT,
        bind: [id],
      });
      const loggedIn = req.session.loggedIn;

      res.render("detail", {
        data: result[0],
        startDate: result[0].start_date,
        endDate: result[0].end_date,
        loggedIn: loggedIn,
      });
      return;
    }

    res.redirect("/");
  } catch (error) {
    console.error("Error in render detail process :", error);
    res.status(500).send("Error retrieving detail");
  }
}

async function renderEdit(req, res) {
  try {
    const id = parseInt(req.params.blog_id);
    const project = `SELECT * FROM projectdumb WHERE id = $1`;
    const result = await db.query(project, {
      type: QueryTypes.SELECT,
      bind: [id],
    });

    res.render("edit-project", {
      data: result[0],
      startDate: result[0].start_date,
      endDate: result[0].end_date,
    });
  } catch (error) {
    console.error("Error in render detail process :", error);
    res.status(500).send("Error retrieving detail");
  }
}

async function postProject(req, res) {
  try {
    imagePath = req.file.path.replace("views\\", "");
    const image = req.file ? imagePath : null;
    const dateDiffStart = new Date(req.body.start_date);
    const dateDiffEnd = new Date(req.body.end_date);

    // const techStack = req.body.technologies.split(",");
    const durationProject = `${
      (dateDiffEnd - dateDiffStart) / (24 * 3600 * 1000)
    } hari`;

    const blog = [
      req.body.title,
      req.body.start_date,
      req.body.end_date,
      req.body.description,
      req.body.technologies,
      durationProject,
      image,
    ];

    const newProject = `INSERT INTO projectdumb (title, start_date, end_date, description, technologies, duration, image, created_date, author) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'Alfi Dharmawan')`;

    await db.query(newProject, { type: QueryTypes.INSERT, bind: blog });
    res.redirect("/project");
  } catch (e) {
    res.send(`<script>alert("Error! ${e.message}")</script>`);
  }
}

async function editProject(req, res) {
  try {
    const blog = [req.body.title, req.body.description, req.params.blog_id];

    const updateProject = `UPDATE projectdumb SET title = $1, description = $2 WHERE id = $3`;

    await db.query(updateProject, { bind: blog });
    res.redirect("/project");
  } catch (e) {
    res.send(`<script>alert("Error! ${e.message}")</script>`);
  }
}

async function deleteProject(req, res) {
  try {
    const id = parseInt(req.params.blog_id);
    const deleteProject = `DELETE FROM projectdumb WHERE id = $1`;

    await db.query(deleteProject, { bind: [id] });
    res.redirect("/project");
  } catch (error) {
    res.send(`<script>alert("Error! ${e.message}")</script>`);
  }
}

function renderTestimonial(req, res) {
  const loggedIn = req.session.loggedIn;
  res.render("testimonial", { loggedIn: loggedIn });
}

function renderContact(req, res) {
  const loggedIn = req.session.loggedIn;
  if (loggedIn) {
    res.render("contact", { loggedIn: loggedIn });
    return;
  }
  res.redirect("/");
}

function renderLogin(req, res) {
  const loggedIn = req.session.loggedIn;
  if (loggedIn) {
    res.redirect("/");
    return;
  }

  res.render("login");
}

async function login(req, res) {
  try {
    const user = [req.body.email, req.body.password];

    const loginUser = `SELECT * FROM projectusers WHERE email = $1 AND password = $2`;
    const result = await db.query(loginUser, {
      type: QueryTypes.SELECT,
      bind: user,
    });

    if (result.length == 0) {
      req.flash("error", "login gagal");
      res.redirect("/login");
      return;
    }

    req.session.user = result[0];
    req.session.loggedIn = true;

    req.flash("succes", "login sukses");
    res.redirect("/");
  } catch (error) {
    console.log(error);

    res.redirect("/login");
  }
}

function renderRegister(req, res) {
  const loggedIn = req.session.loggedIn;
  if (loggedIn) {
    res.redirect("/");
    return;
  }
  res.render("register");
}

async function register(req, res) {
  try {
    const user = [req.body.name, req.body.email, req.body.password];

    const newUser = `INSERT INTO projectusers (name, email, password) VALUES ($1, $2, $3)`;
    await db.query(newUser, {
      type: QueryTypes.INSERT,
      bind: user,
    });

    req.flash("succes", "register berjalan");
    res.redirect("/login");
  } catch (error) {
    res.redirect("/register");
  }
}

function logout(req, res) {
  req.session.destroy();
  res.redirect("/");
}

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});

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
