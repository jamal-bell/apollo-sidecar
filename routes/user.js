import users from "../data/users.js";
import lessons from "../data/lessons.js";
import qa from "../data/qa.js";
import { Router } from "express";
const router = Router();
import express from "express";
const app = express();
import validation from "../data/validation.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

const cloudinaryConfig = cloudinary.config({
  cloud_name: "dcl4odxgu",
  api_key: "913344915682151",
  api_secret: "m-sXkAU8THL0ky6meEXfy4DL0M4",
  secure: true,
});

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
    return res.render("user/register", {
      title: "Registration",
      style_partial: "user-form",
    });
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
        style_partial: "user-form",
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
        style_partial: "user-form",
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
    return res.render("user/login", {
      title: "Login",
      style_partial: "user-form",
    });
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
        console.log(user);
        req.session.authenticated = true;
        req.session.sessionId = user._id;
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
      return res.status(400).render("user/login", {
        title: "Login",
        style_partial: "user-form",
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

  if (req.session.sessionId !== user._id.toString()) {
    return res.render("user/error", {
      errors: "No access to such user's account page.",
    });
  }

  const lessons = [];
  let hasLessons;
  if (user.lessons.length !== 0) {
    hasLessons = true;
    user.lessons.forEach((lessonId) => {
      try {
        lessonId = validation.checkId(lessonId);
      } catch (e) {}

      lessons.push(lessons);
    });
  } else {
    hasLessons = false;
  }

  const qas = [];
  let hasQas;
  if (user.qas.length !== 0) {
    hasQas = true;
    user.qas.forEach((qaId) => {});
  } else {
    hasQas = false;
  }

  return res.render("user/user", {
    title: "Overview",
    style_partial: "overview",
    user: user,
    lessons: "",
    hasLessons: hasLessons,
    qas: "",
  });
});

router.route("/admin").get(async (req, res) => {
  //code here for GET
  if (!req.session.authenticated) {
    return res.redirect("/user/login");
  }

  const user = await users.getUserByEmail(req.session.user.emailAddress);

  if (req.session.sessionId !== user._id.toString()) {
    return res.render("user/error", {
      errors: "No access to such user's account page.",
    });
  }
  return res.render("user/admin", {
    title: "Overview",
    style_partial: "overview",
    user: user,
    lessons: "",
    qas: "",
  });
});

router.route("/public/:userId").get(async (req, res) => {
  //code here for GET
  if (!req.session.authenticated) {
    return res.redirect("/user/login");
  }

  try {
    req.params.userId = validation.checkId(req.params.userId, "User Id");
  } catch (e) {
    return res.status(400).render("/user/error", { title: "Error", error: e });
  }

  try {
    const user = await users.getUserById(req.params.userId);

    if (user) {
    }
    return res.render("user/public", {
      title: "User Overview",
      style_partial: "overview",
      user: user,
    });
  } catch (e) {
    return res.status(400).render("/user/error", { title: "Error", error: e });
  }
});

router.route("/error").get(async (req, res) => {
  //code here for GET
  return res.render("user/error", {
    title: "Error",
    error: "You do not have access to admin.",
  });
});

router.route("/profile").post(async (req, res) => {
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

  return res
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

    return res.render("user/password", {
      title: "Change Password",
      style_partial: "user-form",
    });
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
        style_partial: "user-form",
        errors: errors,
        hasErrors: true,
      });
    }

    try {
      userRegister = await users.updatePassword(emailAddress, newPassword);

      if (userRegister && userRegister.updated) {
        users.logoutUser(emailAddress);
        req.session.destroy();
        return res.render("user/logout", {
          title: "Password Updated",
          message: "Your password have been updated, please login again.",
        });
      }
    } catch (e) {
      return res.status(400).render("user/password", {
        title: "Change Password",
        style_partial: "user-form",
        errors: errors,
        hasErrors: true,
      });
    }

    return res
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
    return res.render("user/logout", {
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

// router.route("/signature").get(async (req, res) => {
//   //code here for GET
//   if (!req.session.authenticated) {
//     return res.redirect("/user/login");
//   }

//   const timestamp = Math.round(new Date().getTime() / 1000);
//   const signature = cloudinary.utils.api_sign_request(
//     {
//       timestamp: timestamp,
//     },
//     cloudinaryConfig.api_secret
//   );
//   return res.json({ timestamp, signature });
// });

router.route("/photo").post(async (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect("/user/login");
  }

  const expectedSignature = cloudinary.utils.api_sign_request(
    { public_id: req.body.public_id, version: req.body.version },
    cloudinaryConfig.api_secret
  );

  const user = await users.getUserByEmail(req.session.user.emailAddress);

  let photoId = "";
  if (user.photo !== "/public/assets/no-photo.jpg") {
    const photoUrl = user.photo;
    photoId = photoUrl.substring(
      photoUrl.lastIndexOf("/") + 1,
      photoUrl.lastIndexOf(".")
    );
  }

  if (expectedSignature === req.body.signature) {
    try {
      const url = `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/w_200,h_200,c_fill,q_100/${req.body.public_id}.jpg`;
      const photoUpdated = await users.updatePhoto(
        req.session.user.emailAddress,
        url
      );

      if (photoUpdated) {
        cloudinary.uploader.destroy(photoId);
        return res.json({
          updated: true,
          user: photoUpdated,
        });
      }
    } catch (e) {
      return res.json({
        updated: false,
        photoErrors: e,
      });
    }
  }
  return res.status(500).render("user/error", {
    error: "Internal Server Error",
    title: "Error",
  });
});

export default router;
