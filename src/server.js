import express from "express";
import session from "express-session";
import { randomBytes } from "node:crypto";
import nocache from "nocache"

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "./views");


const secretKey = randomBytes(32).toString("hex");

app.use(
  session({
    secret: secretKey, 
    resave: false, // Prevent resaving session if unmodified
    saveUninitialized: true, 
    cookie: { secure: false }, 
  })
);

app.use(nocache())

const userName = "admin";
const password = "admin@123";

// Middleware to check if the user is authenticated
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.username) {
    return res.redirect("/"); // Redirect to home if user is logged in
  }
  next();
};

// Middleware to  check if the user is logged in
const requireLogin = (req, res, next) => {
  if (!req.session.username) {
    return res.redirect("/login"); // Redirect to login if user is not authenticated
  }
  next();
};

// Routes
app.get("/", requireLogin, (req, res) => {
  res.render("index.ejs", {
    currentPage: "home",
    greetText: `Welcome ${req.session.username}!`,
  });
});

app.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("login.ejs", { currentPage: "login", error: null });
});

app.post("/submit", (req, res) => {
  if (req.body.username === userName && req.body.password === password) {
    req.session.username = req.body.username; // Store username in session
    res.redirect("/");
  } else {
    res.render("login.ejs", {
      error: "Invalid credentials",
      currentPage: "login",
    });
  }
});

// Logout route to destroy session
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out.");
    }
    res.redirect("/login"); // Redirect to login after logout
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
