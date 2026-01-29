const express = require("express");
const session = require("express-session");
const routes = require("./routes");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

app.use(
  session({
    secret: "ac-service-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(routes);

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
