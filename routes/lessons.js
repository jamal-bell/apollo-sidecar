import { lessonsData } from "../data/index.js";
import { usersData } from "../data/index.js";
import validation from "../data/validation.js";
import lessons from "../data/lessons.js";
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
    console.log("Hitting get");
    try {
      return res.status(200).render("lesson/newlesson", {
        title: "Create Lesson",
      });
    } catch (e) {
      res.status(500).json({ Error: e });
    }
  })
  .post(async (req, res) => {
    const { lessonTitle, description, moduleTitle, text, videoLink } = req.body;
    //console.log(req.body);
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

      //Set this lesson in user profile
      const { _id } = lesson;
      usersData.addLesson(req.session.user._id, _id, "created");

      return res.status(200).render(`lesson/lessonById`, {
        title: "Create Lesson",
        hasErrors: false,
        lessonTitle,
        lessonId: _id.toString(),
        description,
        moduleTitle,
        text,
        videoLink,
        createdBy: null,
        //creatorId,
        //author,
      });
    } catch (error) {
      //console.log(error);
      
      return res.status(400).render("lesson/newlesson", {
        title: "Creating lesson failed",
        error: error,
        hasErrors: true,
        lessonTitle,
        description: description,
        moduleTitle,
        text: text,
        videoLink,
      });
    }
    
    // let errors = [];
    

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
  .route("/addmodule")
  .get(async (req, res) => {
    const lessonId = req.params["lesson-id"];
    return res.render("lesson/publish", {
      title: "Publish Lesson",
      lessonId,
    });
  })
  .post(async (req, res) => {
    try {
      const { lessonId, moduleTitle, text, videoLink, order } = req.body;
      console.log(req.body);

      const orderId = parseInt(order);

      const response = await lessonsData.createModule(
        lessonId,
        orderId,
        moduleTitle,
        text,
        videoLink
      );
      const lesson = await lessonsData.getLessonById(lessonId);

      //console.log("response: " + response);

      return res.render("lesson/publish", {
        title: "Publish Lesson",
        lessonId: lessonId,
        lesson,
      });
    } catch (error) {
      return res.status(400).render("lesson/publish", {
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
  .route("/newlesson/publish/:id")
  .get(async (req, res) => {
    const lessonId = req.params.id;
    const lesson = await lessonsData.getLessonById(lessonId);

    res.render("lesson/publish", {
      title: "Publish Lesson",
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
    const creatorId = `${firstName} ${lastName}`;
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
      return res.status(400).render("partials/publish", {
        title: "Edit Lesson",

        errors: errors,
        hasErrors: true,
        moduleTitle: moduleTitle,
        text: text,
        videoLink: videoLink,
      });
    }

    try {
      const newlesson = await lessonsData.createModule(
        id,
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
