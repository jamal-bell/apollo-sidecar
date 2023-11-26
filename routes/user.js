import users from "../data/users.js";
import { Router } from "express";
const router = Router();
import express from "express";
const app = express();
import validation from "../data/validation.js";

function checkRole(role) {
  if (!role) throw "You must provide the role.";
  if (typeof role !== "string" || role.trim().length === 0)
    throw "Role must be valid strings.";
  role = role.trim().toLowerCase();
  if (role !== "admin" && role !== "user")
    throw "Role can only be admin or user.";
  return role;
}

router.route("/").get(async (req, res) => {
  //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
  return res.json({ error: "YOU SHOULD NOT BE HERE!" });
});

router
  .route("/register")
  .get(async (req, res) => {
    //code here for GET
    res.render("register", { title: "Register" });
  })
  .post(async (req, res) => {
    //code here for POST
    let firstName = req.body.firstNameInput;
    let lastName = req.body.lastNameInput;
    let emailAddress = req.body.emailAddressInput;
    let password = req.body.passwordInput;
    let role = req.body.roleInput;
    let errors = [];

    try {
      firstName = validation.checkString(firstName, "First Name");
    } catch (e) {
      errors.push(e);
    }

    try {
      lastName = validation.checkString(lastName, "Last Name");
    } catch (e) {
      errors.push(e);
    }

    try {
      emailAddress = validation.checkEmail(emailAddress);
    } catch (e) {
      errors.push(e);
    }

    try {
      password = validation.checkPassword(password);
    } catch (e) {
      errors.push(e);
    }

    try {
      role = checkRole(role);
    } catch (e) {
      errors.push(e);
    }

    try {
      if (password !== req.body.confirmPasswordInput)
        throw "Password and confirmed password do not match.";
    } catch (e) {
      errors.push(e);
    }

    let userRegister;

    if (errors.length > 0) {
      return res.status(400).render("register", {
        title: "Register",
        errors: errors,
        hasErrors: true,
        firstName: firstName,
        lastName: lastName,
        emailAddress: req.body.emailAddressInput,
      });
    }

    try {
      userRegister = await users.userRegister(
        firstName,
        lastName,
        emailAddress,
        password,
        role
      );

      if (userRegister && userRegister.insertedUser) {
        return res.redirect("/login");
      }
    } catch (e) {
      res
        .status(500)
        .render("error", { error: "Internal Server Error", title: "Error" });
    }
  });

router
  .route("/login")
  .get(async (req, res) => {
    //code here for GET
    res.render("login", { title: "Login" });
  })
  .post(async (req, res) => {
    //code here for POST
    let emailAddress = req.body.emailAddressInput;
    let password = req.body.passwordInput;
    try {
      emailAddress = validation.checkEmail(emailAddress);
      password = validation.checkPassword(password);
      const user = await users.loginUser(emailAddress, password);
      if (user) {
        req.session.user = {
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          role: user.role,
        };
        if (user.role === "admin") {
          return res.redirect("/admin");
        } else if (user.role === "user") {
          return res.redirect("/account");
        }
      } else {
        throw "Invalid username and/or password.";
      }
    } catch (e) {
      res.status(400).render("login", { title: "Login", error: e });
    }
  });

router.route("/account").get(async (req, res) => {
  //code here for GET
  res.render("account", {
    title: "Overview",
    firstName: req.session.user.firstName,
    lastName: req.session.user.lastName,
    role: req.session.user.role,
    currentTime: new Date().toString(),
  });
});

router.route("/admin").get(async (req, res) => {
  //code here for GET
  res.render("admin", { title: "Admin" });
});

router.route("/error").get(async (req, res) => {
  //code here for GET
  res.render("error", {
    title: "Error",
    error: "You do not have access to admin.",
  });
});

router.route("/logout").get(async (req, res) => {
  //code here for GET
  if (req.session) {
    req.session.destroy();
    res.render("logout", { title: "Logout" });
  }
});

export default router;
