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
  return res.render("user/error", { error: "Internal Error." });
});

router
  .route("/register")
  .get(async (req, res) => {
    //code here for GET
    res.render("user/register", { title: "Registration" });
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
      return res.status(400).render("user/register", {
        title: "Registration",
        errors: errors,
        hasErrors: true,
        firstName: firstName,
        lastName: lastName,
        emailAddress: req.body.emailAddressInput,
      });
    }

    try {
      userRegister = await users.registerUser(
        firstName,
        lastName,
        emailAddress,
        password,
        role
      );

      if (userRegister && userRegister.insertedUser) {
        return res.redirect("/user/login");
      }
    } catch (e) {
      errors.push(e);
      return res.status(400).render("user/register", {
        title: "Registration",
        errors: errors,
        hasErrors: true,
        firstName: firstName,
        lastName: lastName,
        emailAddress: req.body.emailAddressInput,
      });
    }
    res
      .status(500)
      .render("user/error", { error: "Internal Server Error", title: "Error" });
  });

router
  .route("/login")
  .get(async (req, res) => {
    //code here for GET
    res.render("user/login", { title: "Login" });
  })
  .post(async (req, res) => {
    //code here for POST
    let emailAddress = req.body.emailAddressInput;
    let password = req.body.passwordInput;

    let errors = [];

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
      const user = await users.loginUser(emailAddress, password);
      if (user) {
        req.session.authenticated = true;
        req.session.user = {
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          role: user.role,
        };
        if (user.role === "admin") {
          return res.redirect("/user/admin");
        } else if (user.role === "user") {
          return res.redirect("/user/user");
        }
      } else {
        throw "Invalid username and/or password.";
      }
    } catch (e) {
      errors.push(e);
      res.status(400).render("user/login", {
        title: "Login",
        hasErrors: true,
        errors: errors,
      });
    }
  });

router.route("/user").get(async (req, res) => {
  //code here for GET
  if (!req.session.authenticated) {
    return res.redirect("/user/login");
  }

  const user = await users.getUserByEmail(req.session.user.emailAddress);

  res.render("user/user", {
    title: "Overview",
    user: user,
  });
});

router.route("/admin").get(async (req, res) => {
  //code here for GET
  if (!req.session.authenticated) {
    return res.redirect("/user/login");
  }

  const user = await users.getUserByEmail(req.session.user.emailAddress);

  res.render("user/admin", {
    title: "Overview",
    user: user,
  });
});

router.route("/error").get(async (req, res) => {
  //code here for GET
  res.render("user/error", {
    title: "Error",
    error: "You do not have access to admin.",
  });
});

router
  .route("/profile")
  // .get(async (req, res) => {
  //   //code here for GET
  //   if (!req.session.authenticated) {
  //     return res.redirect("/user/login");
  //   }

  //   const user = await users.getUserByEmail(req.session.user.emailAddress);

  //   res.render("user/profile", { title: "Profile", user: user });
  // })
  .post(async (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let emailAddress = req.body.emailAddress;
    let bio = req.body.bio;
    let github = req.body.github;
    let errors = [];

    try {
      firstName = validation.checkString(firstName, "First Name");
    } catch (e) {
      errors.push(`<li>${e}</li>`);
    }

    try {
      lastName = validation.checkString(lastName, "Last Name");
    } catch (e) {
      errors.push(`<li>${e}</li>`);
    }

    try {
      emailAddress = validation.checkEmail(emailAddress);
    } catch (e) {
      errors.push(`<li>${e}</li>`);
    }

    try {
      if (github.trim().length !== 0 && !new URL(github)) {
        throw "Invalid Github Link.";
      }
    } catch (e) {
      errors.push(`<li>${e}</li>`);
    }

    let userUpdated;

    const user = {
      firstName: firstName,
      lastName: lastName,
      emailAddress: emailAddress,
      bio: bio,
      github: github,
    };
    if (errors.length > 0) {
      return res.json({
        errors: errors,
        hasErrors: true,
        user: user,
      });
    }

    try {
      userUpdated = await users.updateUser(emailAddress, user);

      if (userUpdated) {
        return res.json({
          updated: true,
          user: user,
        });
      }
    } catch (e) {
      errors.push(`<li>${e}</li>`);
      return res.json({
        errors: errors,
        hasErrors: true,
        user: user,
      });
    }

    res
      .status(500)
      .render("user/error", { error: "Internal Server Error", title: "Error" });
  });

router
  .route("/password")
  .get(async (req, res) => {
    //code here for GET
    if (!req.session.authenticated) {
      return res.redirect("/user/login");
    }

    res.render("user/password", { title: "Change Password" });
  })
  .post(async (req, res) => {
    //code here for POST
    const user = await users.getUserByEmail(req.session.user.emailAddress);
    const emailAddress = user.emailAddress;
    let currentPassword = req.body.currentPasswordInput;
    let newPassword = req.body.newPasswordInput;
    let confirmNewPassword = req.body.confirmPasswordInput;
    let errors = [];

    try {
      currentPassword = await users.comparePassword(
        emailAddress,
        currentPassword
      );
    } catch (e) {
      errors.push(e);
    }

    try {
      newPassword = validation.checkPassword(newPassword);
    } catch (e) {
      errors.push(e);
    }

    try {
      if (confirmNewPassword !== newPassword)
        throw "New password and confirm password do not match.";
    } catch (e) {
      errors.push(e);
    }

    let userRegister;

    if (errors.length > 0) {
      return res.status(400).render("user/password", {
        title: "Change Password",
        errors: errors,
        hasErrors: true,
      });
    }

    try {
      userRegister = await users.updatePassword(emailAddress, newPassword);

      if (userRegister && userRegister.updated) {
        users.logoutUser(emailAddress);
        req.session.destroy();
        res.render("user/logout", {
          title: "Password Updated",
          message: "Your password have been updated, please login again.",
        });
      }
    } catch (e) {
      return res.status(400).render("user/password", {
        title: "Change Password",
        errors: errors,
        hasErrors: true,
      });
    }
    res
      .status(500)
      .render("user/error", { error: "Internal Server Error", title: "Error" });
  });

router.route("/logout").get(async (req, res) => {
  //code here for GET
  if (!req.session.authenticated) {
    return res.redirect("/user/login");
  }

  const emailAddress = req.session.user.emailAddress;

  if (req.session) {
    users.logoutUser(emailAddress);
    req.session.destroy();
    res.render("user/logout", {
      title: "Logout",
      message: "You have been logged out.",
    });
  }
});

router.route("/cancel").get(async (req, res) => {
  //code here for GET
  if (!req.session.authenticated) {
    return res.redirect("/user/login");
  }

  const cancel = await users.removeUser(req.session.user.emailAddress);

  if (cancel && cancel.deleted) {
    req.session.destroy();
    return res.render("user/logout", {
      title: "Account canceled",
      message: "Your account have been canceled.",
    });
  } else {
    return res.render("user/error", { title: "Failed to delete account" });
  }
});

export default router;
