import { lessons, qa } from "../config/mongoCollections.js";
import users from "../data/users.js";
import lessonsData from "../data/lessons.js";
import qaData from "../data/qa.js";
import { ObjectId } from "mongodb";
import { Router } from "express";
const router = Router();
import express from "express";
const app = express();
import validation from "../data/validation.js";
// import cloudinary from "cloudinary";
import dotenv from "dotenv";
import xss from "xss";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { promisify } from "util";
dotenv.config();

const region = "us-east-1";
const bucketName = "apollo-sidecar";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const randomBytes = promisify(crypto.randomBytes);

const s3Function = {
  async generateUploadURL() {
    const rawBytes = await randomBytes(16);
    const imageName = rawBytes.toString("hex");

    const params = {
      Bucket: bucketName,
      Key: imageName,
    };

    const command = new PutObjectCommand(params);

    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 600 });

    return uploadURL;
  },

  async deleteImageFromS3(imageKey) {
    try {
      const params = {
        Bucket: bucketName,
        Key: imageKey,
      };

      const command = new DeleteObjectCommand(params);
      await s3.send(command);
    } catch (e) {
      throw `Error in file deletion: ${e}`;
    }
  },
};

// const cloudinaryConfig = cloudinary.config({
//   cloud_name: "dcl4odxgu",
//   api_key: "913344915682151",
//   api_secret: "m-sXkAU8THL0ky6meEXfy4DL0M4",
//   secure: true,
// });

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
    return res.render('user/register', {
      title: 'Registration',
      style_partial: "css_users",
      script_partial: 'user-form',
    });
  })
  .post(async (req, res) => {
    //code here for POST
    let firstName = xss(req.body.firstNameInput);
    let lastName = xss(req.body.lastNameInput);
    let emailAddress = xss(req.body.emailAddressInput);
    let handle = xss(req.body.handleInput);
    let password = xss(req.body.passwordInput);
    let role = xss(req.body.roleInput);
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
      handle = validation.checkHandle(handle);
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
      return res.status(400).render('user/register', {
        title: 'Registration',
        style_partial: "css_users",
        script_partial: 'user-form',
        errors: errors,
        hasErrors: true,
        firstName: firstName,
        lastName: lastName,
        emailAddress: emailAddress,
        handle: handle,
      });
    }

    try {
      userRegister = await users.registerUser(
        firstName,
        lastName,
        emailAddress,
        handle,
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
        style_partial: "css_users",
        script_partial: "user-form",
        errors: errors,
        hasErrors: true,
        firstName: firstName,
        lastName: lastName,
        emailAddress: emailAddress,
        handle: handle,
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
      style_partial: "css_users",
      script_partial: "user-form",
    });
  })
  .post(async (req, res) => {
    //code here for POST
    let emailAddress = xss(req.body.emailAddressInput);
    let password = xss(req.body.passwordInput);

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
        req.session.sessionId = user._id;
        req.session.user = {
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          handle: user.handle,
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
        style_partial: "css_users",
        script_partial: "user-form",
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

  const userLessons = [];
  let hasLessons;
  if (user.progress.inProgressLessonId.length !== 0) {
    hasLessons = true;
    for (let i = user.progress.inProgressLessonId.length - 1; i >= 0; i--) {
      let currLesson;
      try {
        let lessonId = validation.checkId(
          user.progress.inProgressLessonId[i].lessonId.toString(),
          "lessonId"
        );
        currLesson = await lessonsData.getLessonById(lessonId);
        currLesson._id = currLesson._id.toString();
      } catch (e) {
        return res.status(400).render("user/error", { error: e });
      }
      userLessons.push(currLesson);
    }
  } else {
    hasLessons = false;
  }

  const lessonCreated = [];
  let createdLessons;
  if (user.progress.createdLessonId.length !== 0) {
    createdLessons = true;
    for (let i = user.progress.createdLessonId.length - 1; i >= 0; i--) {
      let currLesson;
      try {
        let lessonId = validation.checkId(
          user.progress.createdLessonId[i].lessonId.toString(),
          "lessonId"
        );
        currLesson = await lessonsData.getLessonById(lessonId);
        currLesson._id = currLesson._id.toString();
      } catch (e) {
        return res.status(400).render("user/error", { error: e });
      }
      lessonCreated.push(currLesson);
    }
  } else {
    createdLessons = false;
  }

  const userQuestions = [];
  let hasQuestions;
  if (user.progress.qaPlatform.questions.length !== 0) {
    hasQuestions = true;
    let count = 0;
    for (let i = user.progress.qaPlatform.questions.length - 1; i >= 0; i--) {
      let currQa;
      let currLesson;
      let currContent;
      try {
        const qaId = validation.checkId(
          user.progress.qaPlatform.questions[i].toString()
        );
        currQa = await qaData.getQa(qaId);
        currQa._id = currQa._id.toString();

        const lessonId = validation.checkId(
          currQa.lessonId.toString(),
          "lessonId"
        );
        const contentId = validation.checkId(
          currQa.contentId.toString(),
          "lessonId"
        );
        currLesson = await lessonsData.getLessonById(lessonId);
        currLesson._id = currLesson._id.toString();

        currContent = await lessonsCollection.findOne(
          {
            _id: new ObjectId(lessonId),
            "contents._id": new ObjectId(contentId),
          },
          {
            projection: {
              "contents.$": 1,
            },
          }
        );
        currContent._id = currContent._id.toString();
      } catch (e) {
        return res.status(400).render("user/error", { error: e });
      }
      userQuestions.push({
        lesson: currLesson,
        content: content,
        question: currQa,
      });
      count++;
      if (count === 3) break;
    }
  } else {
    hasQuestions = false;
  }

  const userAnswers = [];
  let hasAnswers;
  if (user.progress.qaPlatform.answers.length !== 0) {
    hasAnswers = true;
    let count = 0;
    for (let i = user.progress.qaPlatform.answers.length - 1; i >= 0; i--) {
      let currQa;
      let answers;
      let currLesson;
      let currContent;
      try {
        const qaId = validation.checkId(
          user.progress.qaPlatform.answers[i].toString()
        );
        currQa = await qaData.getQa(qaId);
        currQa._id = currQa._id.toString();

        const lessonId = validation.checkId(
          currQa.lessonId.toString(),
          "lessonId"
        );
        const contentId = validation.checkId(
          currQa.contentId.toString(),
          "lessonId"
        );

        currLesson = await lessonsData.getLessonById(lessonId);
        currLesson._id = currLesson._id.toString();
        currContent = await lessonsCollection.findOne(
          {
            _id: new ObjectId(lessonId),
            "contents._id": new ObjectId(contentId),
          },
          {
            projection: {
              "contents.$": 1,
            },
          }
        );
        currContent._id = currContent._id.toString();
        answers = currQa.answers
          .filter((answer) => answer.creatorId.equals(user._id))
          .sort((a, b) => b.vote - a.vote)
          .slice(0, 3)
          .map((answer) => ({
            answerText: answer.text,
            answerVotes: answer.votes,
          }));
      } catch (e) {
        return res.status(400).render("user/error", { error: e });
      }
      userAnswers.push({
        question: currQa,
        answers: answers,
        lesson: currLesson,
        content: currContent,
      });
      count++;
      if (count === 3) break;
    }
  } else {
    hasAnswers = false;
  }

  return res.status(200).render("user/user", {
    title: "Overview",
    style_partial: "css_userprofile",
    script_partial: "overview",
    user: user,
    lessons: userLessons,
    hasLessons: hasLessons,
    lessonCreated: lessonCreated,
    createdLessons: createdLessons,
    questions: userQuestions,
    hasQuestions: hasQuestions,
    answers: userAnswers,
    hasAnswers: hasAnswers,
  });
});

router.route("/admin").get(async (req, res) => {
  //code here for GET
  if (!req.session.authenticated) {
    return res.redirect("/user/login");
  }

  const user = await users.getUserByEmail(req.session.user.emailAddress);
  const lessonsCollection = await lessons();

  if (req.session.sessionId !== user._id.toString()) {
    return res.render("user/error", {
      errors: "No access to such user's account page.",
    });
  }

  const adminLessons = [];
  let hasLessons;
  if (user.progress.createdLessonId.length !== 0) {
    hasLessons = true;
    for (let i = user.progress.createdLessonId.length - 1; i >= 0; i--) {
      let currLesson;
      try {
        let lessonId = validation.checkId(
          user.progress.createdLessonId[i].lessonId.toString(),
          "lessonId"
        );
        currLesson = await lessonsData.getLessonById(lessonId);
        currLesson._id = currLesson._id.toString();
      } catch (e) {
        return res.status(400).render("user/error", { error: e });
      }
      adminLessons.push(currLesson);
    }
  } else {
    hasLessons = false;
  }

  const adminQuestions = [];
  let hasQuestions;
  if (user.progress.qaPlatform.questions.length !== 0) {
    hasQuestions = true;
    let count = 0;
    for (let i = user.progress.qaPlatform.questions.length - 1; i >= 0; i--) {
      let currQa;
      let currLesson;
      let currContent;
      try {
        const qaId = validation.checkId(
          user.progress.qaPlatform.questions[i].questionId.toString()
        );

        currQa = await qaData.getQa(qaId);
        currQa._id = currQa._id.toString();

        const lessonId = validation.checkId(
          currQa.lessonId.toString(),
          "lessonId"
        );
        const contentId = validation.checkId(
          currQa.contentId.toString(),
          "lessonId"
        );
        currLesson = await lessonsData.getLessonById(lessonId);
        currLesson._id = currLesson._id.toString();

        currContent = await lessonsCollection.findOne(
          {
            _id: new ObjectId(lessonId),
            "contents._id": new ObjectId(contentId),
          },
          {
            projection: {
              "contents.$": 1,
            },
          }
        );
        currContent._id = currContent._id.toString();
      } catch (e) {
        return res.status(400).render("user/error", { error: e });
      }
      adminQuestions.push({
        lesson: currLesson,
        content: currContent,
        question: currQa,
      });
      count++;
      if (count === 3) break;
    }
  } else {
    hasQuestions = false;
  }

  const adminAnswers = [];
  let hasAnswers;
  if (user.progress.qaPlatform.answers.length !== 0) {
    hasAnswers = true;
    let count = 0;
    for (let i = user.progress.qaPlatform.answers.length - 1; i >= 0; i--) {
      let currQa;
      let answers;
      let currLesson;
      let currContent;
      try {
        const qaId = validation.checkId(
          user.progress.qaPlatform.answers[i].postId.toString()
        );
        currQa = await qaData.getQa(qaId);
        currQa._id = currQa._id.toString();

        const lessonId = validation.checkId(
          currQa.lessonId.toString(),
          "lessonId"
        );
        const contentId = validation.checkId(
          currQa.contentId.toString(),
          "lessonId"
        );

        currLesson = await lessonsData.getLessonById(lessonId);
        currLesson._id = currLesson._id.toString();
        currContent = await lessonsCollection.findOne(
          {
            _id: new ObjectId(lessonId),
            "contents._id": new ObjectId(contentId),
          },
          {
            projection: {
              "contents.$": 1,
            },
          }
        );
        currContent._id = currContent._id.toString();
        answers = currQa.answers
          .filter((answer) => answer.creatorId.equals(user._id))
          .sort((a, b) => b.vote - a.vote)
          .slice(0, 3)
          .map((answer) => ({
            answerText: answer.text,
            answerVotes: answer.votes,
          }));
      } catch (e) {
        return res.status(400).render("user/error", { error: e });
      }
      adminAnswers.push({
        question: currQa,
        answers: answers,
        lesson: currLesson,
        content: currContent,
      });
      count++;
      if (count === 3) break;
    }
  } else {
    hasAnswers = false;
  }

  return res.status(200).render("user/admin", {
    title: "Overview",
    style_partial: "css_userprofile",
    script_partial: "overview",
    user: user,
    lessons: adminLessons,
    hasLessons: hasLessons,
    questions: adminQuestions,
    hasQuestions: hasQuestions,
    answers: adminAnswers,
    hasAnswers: hasAnswers,
  });
});

router.route("/handle/:handle").get(async (req, res) => {
  //code here for GET
  try {
    req.params.handle = validation.checkHandle(req.params.handle);
  } catch (e) {
    return res.status(400).render("user/error", { title: "Error", error: e });
  }

  try {
    const user = await users.getUserByHandle(req.params.handle);

    if (user) {
    }
    return res.status(200).render("user/public", {
      title: "User Overview",
      style_partial: "css_userprofile",
      script_partial: "overview",
      user: user,
    });
  } catch (e) {
    return res.status(400).render("user/error", { title: "Error", error: e });
  }
});

router.route("/public/:userId").get(async (req, res) => {
  //code here for GET

  try {
    req.params.userId = validation.checkId(req.params.userId, "User Id");
  } catch (e) {
    return res.status(400).render("user/error", { title: "Error", error: e });
  }

  try {
    const user = await users.getUserById(req.params.userId);

    if (user) {
    }
    return res.status(200).render("user/public", {
      title: "User Overview",
      style_partial: "css_userprofile",
      script_partial: "overview",
      user: user,
    });
  } catch (e) {
    return res.status(400).render("user/error", { title: "Error", error: e });
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
  let firstName = xss(req.body.firstName);
  let lastName = xss(req.body.lastName);
  let emailAddress = xss(req.body.emailAddress);
  let bio = xss(req.body.bio);
  let github = xss(req.body.github);
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
    _id: req.session.sessionId,
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

    return res.status(200).render("user/password", {
      title: "Change Password",
      style_partial: "css_users",
      script_partial: "user-form",
    });
  })
  .post(async (req, res) => {
    //code here for POST
    let emailAddress = xss(req.user.emailAddress.trim());
    let currentPassword = xss(req.body.currentPasswordInput);
    let newPassword = xss(req.body.newPasswordInput);
    let confirmNewPassword = xss(req.body.confirmPasswordInput);
    let errors = [];
    try {
      const user = await users.getUserByEmail(emailAddress);
      emailAddress = user.emailAddress;
    } catch (e) {
      errors.push(e);
    }

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
        style_partial: "css_users",
        script_partial: "user-form",
        errors: errors,
        hasErrors: true,
      });
    }

    try {
      userRegister = await users.updatePassword(emailAddress, newPassword);

      if (userRegister && userRegister.updated) {
        users.logoutUser(emailAddress);
        req.session.destroy();
        return res.status(200).render("user/logout", {
          title: "Password Updated",
          message: "Your password have been updated, please login again.",
        });
      }
    } catch (e) {
      return res.status(400).render("user/password", {
        title: "Change Password",
        style_partial: "css_users",
        script_partial: "user-form",
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
    return res.status(200).render("user/logout", {
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
    return res.status(200).render("user/logout", {
      title: "Account canceled",
      message: "Your account have been canceled.",
    });
  } else {
    return res.render("user/error", { title: "Failed to delete account" });
  }
});

// //Cloudinary
// router.route("/photo").post(async (req, res) => {
//   if (!req.session.authenticated) {
//     return res.redirect("/user/login");
//   }
//   req.body.public_id = xss(req.body.public_id);
//   req.body.version = xss(req.body.version);
//   req.body.signature = xss(req.body.signature);
//   let emailAddress = xss(req.session.user.emailAddress.trim());

//   const expectedSignature = cloudinary.utils.api_sign_request(
//     { public_id: req.body.public_id, version: req.body.version },
//     cloudinaryConfig.api_secret
//   );

//   const user = await users.getUserByEmail(emailAddress);

//   let photoId = "";
//   if (user.photo !== "/public/assets/no-photo.jpg") {
//     const photoUrl = user.photo;
//     photoId = photoUrl.substring(
//       photoUrl.lastIndexOf("/") + 1,
//       photoUrl.lastIndexOf(".")
//     );
//   }

//   if (expectedSignature === req.body.signature) {
//     try {
//       const url = `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/w_200,h_200,c_fill,q_100/${req.body.public_id}.jpg`;
//       const photoUpdated = await users.updatePhoto(emailAddress, url);

//       if (photoUpdated) {
//         cloudinary.uploader.destroy(photoId);
//         return res.json({
//           updated: true,
//           user: photoUpdated,
//         });
//       }
//     } catch (e) {
//       return res.json({
//         updated: false,
//         photoErrors: e,
//       });
//     }
//   }
//   return res.status(500).render("user/error", {
//     error: "Internal Server Error",
//     title: "Error",
//   });
// });

router.route("/s3Url").get(async (req, res) => {
  const url = await s3Function.generateUploadURL();
  res.json({ url });
});

//AWS S3
router.route("/s3").post(async (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect("/user/login");
  }
  const newUrl = xss(req.body.url).trim();

  let emailAddress = xss(req.session.user.emailAddress.trim());

  const user = await users.getUserByEmail(emailAddress);

  let photoKey = "";

  try {
    if (newUrl.length === 0 || !new URL(newUrl)) throw "Invalid photo url";
    if (user.photo !== "/public/assets/no-photo.jpg") {
      const photoUrl = user.photo;
      photoKey = photoUrl.substring(photoUrl.lastIndexOf("/") + 1);
    }

    const photoUpdated = await users.updatePhoto(emailAddress, newUrl);

    if (photoUpdated) {
      if (photoKey !== "") {
        await s3Function.deleteImageFromS3(photoKey);
      }
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
  return res.status(500).render("user/error", {
    error: "Internal Server Error",
    title: "Error",
  });
});

router.get("/*", (req, res) => {
  res.status(404).render("user/error", {
    error: "Page Not Found",
    title: "No Such Page Exists.",
  });
});

// router.get("/user/*", (req, res) => {
//   res.status(404).render("user/error", {
//     error: "Page Not Found",
//     title: "No Such Page Exists.",
//   });
// });

// router.get("/public/*", (req, res) => {
//   res.status(404).render("user/error", {
//     error: "Page Not Found",
//     title: "No Such Page Exists.",
//   });
// });

// router.get("/admin/*", (req, res) => {
//   res.status(404).render("user/error", {
//     error: "Page Not Found",
//     title: "No Such Page Exists.",
//   });
// });

// router.get("/password/*", (req, res) => {
//   res.status(404).render("user/error", {
//     error: "Page Not Found",
//     title: "No Such Page Exists.",
//   });
// });

// router.get("/cancel/*", (req, res) => {
//   res.status(404).render("user/error", {
//     error: "Page Not Found",
//     title: "No Such Page Exists.",
//   });
// });

// router.get("/register/*", (req, res) => {
//   res.status(404).render("user/error", {
//     error: "Page Not Found",
//     title: "No Such Page Exists.",
//   });
// });

// router.get("/login/*", (req, res) => {
//   res.status(404).render("user/error", {
//     error: "Page Not Found",
//     title: "No Such Page Exists.",
//   });
// });

// router.get("/cancel/*", (req, res) => {
//   res.status(404).render("user/error", {
//     error: "Page Not Found",
//     title: "No Such Page Exists.",
//   });
// });

export default router;
