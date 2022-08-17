// routes/auth.routes.js
const bcrypt = require("bcrypt");
const saltRounds = 10;

const { Router } = require("express");
const router = new Router();

const User = require("../models/User.model");

// GET route ==> to display the signup form to users
router.get("/signup", (req, res) => res.render("auth/signup"));
// POST route ==> to process form data
router.post("/signup", (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        username,
        password: hashedPassword,
      }).then((userFromDB) => {
        req.session.currentUser = userFromDB;
        console.log("Newly created user is: ", userFromDB, req.session);
        res.redirect("/auth/profile");
      });
    })

    .catch((error) => console.log(error));
  //Authentication logic goes here
});

/* GET Profile page */
router.get("/profile", (req, res) => {
  // console.log("profile page", req.session);
  const { username } = req.session.currentUser;
  res.render("auth/profile", { username });
});

router.get("/login", (req, res) => {
  console.log("req session", req.session);
  res.render("auth/login");
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check for empty fields
  if (username === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Please enter both, username and password to login.",
    });
    return;
  }
  // 1.  if the user is registered ==> meaning did user with provided username already exist in our app,

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        // 3. send an error message to the user if any of above is not valid,
        res.render("auth/login", {
          errorMessage: "user is not registered. Try with other username.",
        });
        return;
        // 2. if the password provided by the user is valid,
      } else if (bcrypt.compareSync(password, user.password)) {
        // 4. if both are correct, let the user in the app.
        req.session.currentUser = user;
        res.render("auth/profile", user);
      } else {
        // 3. send an error message to the user if any of above is not valid,
        res.render("auth/login", { errorMessage: "Incorrect password." });
      }
    })
    .catch((err) => console.log(err));
});

router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect("/");
  });
});
module.exports = router;
