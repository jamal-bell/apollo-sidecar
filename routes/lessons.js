import { lessonsData } from "../data/index.js";
import validation from "../data/validation.js";
import lessons from "../data/lessons.js";
import express from "express";
import { Router } from "express";
const app = express();
const router = Router();

router.route("/").get(async (req, res) => {
  //reserved for logging
  return res.render("user/error", { error: "Internal Error." });
});

router.route("/lessons").get(async (req, res) => {
  //Lesson 'home' list of all lessons, unrestricted
  const lessons = await lessonsData.getAllLessons();

  res.render("lesson/lessons", {
    title: "Lessons",
    pageTitle: "Lessons",
    lessons: lessons,
  });
});

router.route("/lesson/:id").get(async (req, res) => {
  if (!req.session.authenticated) {
    //return res.redirect("/user/login");
  }
  const id = req.params.id;
  const lessonFound = await lessonsData.getLessonById(id);
  res.status(200).render("lesson/lessonById", {
    title: lessonFound.title,
    title: lessonFound.title,
    description: lessonFound.description,
    contents: lessonFound.contents,
  });
});

router
  .route("/newlesson")
  //new lesson form
  .get(async (req, res) => {
    try {
      return res.status(200).render("lesson/newlesson", {
        title: "Create Lesson",
      });
    } catch (error) {
      res.status(500).json({ Error: e });
    }
  })
  //post saves to lessons collection and shows preview of what to publish
  .post(async (req, res) => {
    if (!req.session.authenticated) {
      //and admin
      return res.redirect("/user/login");
    }

    let title = req.body.titleInput;
    let description = req.body.descriptionInput;
    let moduleTitle = req.body.contents.moduleTitle;
    let creatorId = req.session.user.firstName;
    let text = req.body.contents.text;
    let videoLink = req.body.contents.videoLink;
    let errors = [];
    let createdBy;

    try {
      title = validation.checkContent(text, "lesson title", 3, 250);
    } catch (e) {
      errors.push(e);
    }
    //TODO other validation

    req.session.user.role == "admin"
      ? createdBy == "admin"
      : createdBy == "user";

    if (errors.length > 0) {
      return res.status(400).render("lesson/newlesson", {
        title: "Create Lesson",
        title: "Create Lesson",
        errors: errors,
        hasErrors: true,
        title: title,
        description: description,
      });
    }

    //call data function
    try {
      await lessonsData.createLesson(title, description, contents);
      //if successful, render lesson/:id
    } catch (e) {
      errors.push(e);
      return res.status(400).render("lesson/newlesson", {
        title: "Create Lesson",
        errors: errors,
        hasErrors: true,
        title: title,
        description: description,
        createdBy: createdBy,
      });
    }
    res
      .status(500)
      .render("/error", { error: "Internal Server Error", title: "Error" });
  })
  .put(async (req, res) => {});

router.route("/newlesson/publish").get(async (req, res) => {
  //Lesson 'home' list of all lessons, unrestricted
  const lessons = await lessonsData.getAllLessons(); //and project this draft???

  res.render("lesson/publish", {
    title: "Publish Lesson",
    lessons: lessons,
  })
}).post(async (req, res) => {
  if (!req.session.authenticated) {
    //and admin
    return res.redirect("/user/login");
  }

  let moduleTitle = req.body.contents.moduleTitle;
  let creatorId = req.session.user.firstName;
  let text = req.body.contents.text;
  let videoLink = req.body.contents.videoLink;
  let errors = [];
  let createdBy;

  try {
    title = validation.checkContent(text, "lesson title", 3, 250);
  } catch (e) {
    errors.push(e);
  }
  //TODO other validation

  req.session.user.role == "admin"
    ? createdBy == "admin"
    : createdBy == "user";

  if (errors.length > 0) {
    return res.status(400).render("lesson/publish", {
      title: "Publish Lesson",
      title: "Publish Lesson",
      errors: errors,
      hasErrors: true,
      moduleTitle: moduleTitle,
      text: text,
      videoLink: videoLink
    });
  }

  //call data function
  try {
    await lessonsData.createModule(id, order, moduleTitle, text, videoLink);
    //if successful, render lesson/:id
  } catch (e) {
    errors.push(e);
    return res.status(400).render("lesson/publish", {
      title: "Publish Lesson",
      errors: errors,
      hasErrors: true,
      moduleTitle: moduleTitle,
      text: text,
      videoLink: videoLink
    });
  }
  res
    .status(500)
    .render("/error", { error: "Internal Server Error", title: "Error" });
})

export default router;
