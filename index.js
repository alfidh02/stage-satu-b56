const express = require("express");
const app = express();
const port = 3000;

// routing
app.get("/", (req, res) => {
  res.send("hello world!!");
});

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
