import { lessonsData } from "../data/index.js";
import { usersData } from "../data/index.js";
import validation from "../data/validation.js";
import express from "express";
import { Router } from "express";
const app = express();
const router = Router();

// router.route("/").get(async (req, res) => {
//   //reserved for logging
//   return res.render("user/error", { error: "Internal Error." });
// });

router.route("/lessons").get(async (req, res) => {
  //Lesson 'home' list of all lessons, unrestricted
  const lessons = await lessonsData.getAllLessons();

  res.render("lesson/lessons", {
    title: "Lessons",
    lessons: lessons,
  });
});

router.route("/lesson/:id").get(async (req, res) => {
  // if (!req.session.authenticated) {
  //   return res.redirect("/user/login");
  // }
  try {
    req.params.id = validation.checkId(req.params.id, "Id URL Param");
  } catch (e) {
    return res
      .status(400)
      .render("/error", { error: "Unknown url id param", title: "Error" });
  }
  const lessonFound = await lessonsData.getLessonById(req.params.id);
  res.status(200).render("lesson/lessonById", {
    lessonId: req.params.id,
    title: lessonFound.title,
    moduleTitle: lessonFound.moduleTitle,
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
        style_partial: "user-form",
      });
    } catch (e) {
      res.status(500).json({ Error: e });
    }
  })
  .post(async (req, res) => {
    const { lessonTitle, description, moduleTitle, text, videoLink } = req.body;
    try {
      const content = [
        {
          moduleTitle,
          videoLink,
          text,
          order: 1,
        },
      ];

      const lesson = await lessonsData.createLesson(
        lessonTitle,
        description,
        content,
        moduleTitle,
        text,
        videoLink
      );

      // const user = await usersData.getUserByEmail(
      //   req.session.user.emailAddress
      // );

      // if (req.session.sessionId !== user._id.toString()) {
      //   return res.render("error", {
      //     errors: "Could not get user.",
      //   });
      // }
      // const creatorId = user.id;
      // const author = user.firstName + user.lastName;

      const { _id } = lesson;
      const lessonId = _id.toString();

      const addedToUser = await usersData.addLesson(
        req.session.sessionId,
        lessonId,
        "created"
      );

      if (!addedToUser) throw "Could not add Lesson to user.";

      return res.status(200).render("lesson/publish", {
        title: "Create Lesson",
        hasErrors: false,
        lessonTitle,
        lessonId: lessonId.toString(),
        description,
        moduleTitle,
        text,
        videoLink,
        style_partial: "lesson",
        //createdBy: null,
        //creatorId,
        //author,
      });
    } catch (error) {
      //console.log(error);
      return res.status(400).render(`lesson/newlesson`, {
        title: "Creating lesson failed",
        pageTitle: "Oops, Try again",
        error: error,
        hasErrors: true,
        lessonTitle,
        description: description,
        moduleTitle,
        text: text,
        videoLink,
      });
    }
    // const creatorId =
    //   res.session.user.firstName + " " + res.session.user.lastName;
    // let title = req.body.titleInput;
    // let description = req.body.descriptionInput;
    // let moduleTitle = req.body.contents.moduleTitle;
    // let text = req.body.contents.text;
    // let videoLink = req.body.contents.videoLink;
    // let errors = [];
    // let createdBy;

    // try {
    //   await lessonsData.createLesson(title, description, contents);
    //   //if successful, render lesson/:id
    // } catch (e) {
    //   errors.push(e);
    //   return res.status(400).render("lesson/newlesson", {
    //     title: "Create Lesson",
    //     errors: errors,
    //     hasErrors: true,
    //     title: title,
    //     description: description,
    //     createdBy: createdBy,
    //   });
    // }
    // res
    //   .status(500)
    //   .render("/error", { error: "Internal Server Error", title: "Error" });
  });

router
  .route("/addmodule/:id")
  .get(async (req, res) => {
    const lessonId = req.params.id;
    //console.log("req.params at addmodule route: "+req.params);
    const lesson = await lessonsData.getLessonById(lessonId);
    return res.status(200).render("lesson/publish", {
      title: "Publish Lesson",
      lessonId,
      lesson,
      style_partial: "lesson",
    });
  })
  .post(async (req, res) => {
    try {
      let { lessonId, moduleTitle, text, videoLink, order } = req.body;
      //console.log(order);

      order = "undefined" ? 1 : parseInt(order);

      const response = await lessonsData.createModule(
        lessonId,
        order,
        moduleTitle,
        text,
        videoLink
      );
      const lesson = await lessonsData.getLessonById(lessonId);

      //console.log("response: " + response);

      return res.json({
        updated: true,
        title: "Publish Lesson",
        moduleTitle: moduleTitle,
        lessonId: lessonId,
        text: text,
        order: order,
        videoLink: videoLink,
        
      });
    } catch (error) {
      return res.status(400).json({
        title: "Edit Lesson",
        errors: error,
        hasErrors: true,
        moduleTitle: "",
        text: "",
        videoLink: "",
      });
    }
  });

router
  .route("published/:id")
  .get(async (req, res) => {
    const lessonId = req.params.id;
    const lesson = await lessonsData.getLessonById(lessonId);

    res.render("lessonById", {
      title: "Lesson Published!",
      lesson,
      lessonId,
    });
  })
  .post(async (req, res) => {
    // if (!req.session.authenticated) {

    //   return res.redirect("/user/login");
    // }
    const firstName = res.session.user.firstName;
    const lastName = res.session.user.lastName;
    let moduleTitle = req.body.contents.moduleTitle;
    const author = `${firstName} ${lastName}`;
    let text = req.body.contents.text;
    let videoLink = req.body.contents.videoLink;
    let errors = [];
    let createdBy;

    try {
      text = validation.checkContent(text, "lesson title", 3, 250);
    } catch (e) {
      errors.push(e);
    }
    //TODO other validation

    req.session.user.role == "admin"
      ? createdBy == "admin"
      : createdBy == "user";

    if (errors.length > 0) {
      return res.status(400).render("lesson/publish", {
        title: "Error Publishing - Try Again",
        errors: errors,
        hasErrors: true,
        moduleTitle: moduleTitle,
        text: text,
        videoLink: videoLink,
        style_partial: "lesson",
      });
    }

    //call data function
    try {
      const newlesson = await lessonsData.createModule(
        lessonId, // I CHANGED THIS
        order,
        moduleTitle,
        text,
        videoLink
      );

      //if successful, render lesson/:id
      res.status(200).render("lesson/lessonById", {
        lessonTitle,
        description,
        order,
        moduleTitle,
        creatorId,
        videoLink,
        text,
        author,
      });
    } catch (e) {
      errors.push(e);
      return res.status(400).render("lesson/publish", {
        title: "Edit Lesson",
        errors: errors,
        hasErrors: true,
        moduleTitle: moduleTitle,
        text: text,
        videoLink: videoLink,
        style_partial: "lesson",
      });
    }
    res
      .status(500)
      .render("/error", { error: "Internal Server Error", title: "Error" });
  });

router.route("/error").get(async (req, res) => {
  //code here for GET
  return res.render("error", {
    title: "Error",
    error: "You do not have access.",
  });
});

export default router;
