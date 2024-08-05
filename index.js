const express = require("express");
const app = express();
const port = 3000;

app.set("view engine", "hbs");
app.set("views", "views");

// to access static files
app.use("/assets", express.static("assets"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const blogs = [];

// routing
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/project", renderProject);
app.post("/project", addProject);
app.get("/testimonial", renderTestimonial);
app.get("/contact", renderContact);
app.get("/detail", renderDetail);

function renderProject(req, res) {
  res.render("project", {
    data: blogs,
  });
}
function addProject(req, res) {
  blogs.unshift(req.body);
  res.redirect("/project");
}
function renderTestimonial(req, res) {
  res.render("testimonial");
}
function renderContact(req, res) {
  res.render("contact");
}
function renderDetail(req, res) {
  res.render("detail");
}

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
