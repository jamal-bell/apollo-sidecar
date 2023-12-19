import { lessonsData } from "../data/index.js";
import { usersData } from "../data/index.js";
import validation from "../data/validation.js";
import express from "express";
import { Router } from "express";
import xss from "xss";
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
    title: "Lessons Library",
    lessons: lessons,
    style_partial: "css_content",
    leftmenu_partial: "html_lessonMenu",
  });
});

router
  .route("/lesson/:id")
  .get(async (req, res) => {
    try {
      req.params.id = validation.checkId(req.params.id, "Id URL Param");
    } catch (e) {
      return res
        .status(400)
        .render("error", { error: "Unknown url id param", title: "Error" });
    }
    const lessonFound = await lessonsData.getLessonById(req.params.id);

    const user = await usersData.getUserById(req.session.sessionId);
    let isLink;

    let alreadyTaken = false;
    user.progress.inProgressLessonId.forEach((lesson) => {
      if (lessonFound.lessonId.toString() === req.params.id) {
        alreadyTaken = true;
      }
    });
    let handle = req.session.user.handle;
    let isAdmin = req.session.user.role === "admin" ? true : false;
    if (lessonFound.creatorId.toString() === req.session.sessionId) {
      isAdmin = true;
    }
    return res.status(200).render("lesson/lessonById", {
      title: "Lesson Detail",
      handle: handle,
      alreadyTaken: alreadyTaken,
      isAdmin: isAdmin,
      lessonId: req.params.id,
      lessonTitle: lessonFound.title,
      moduleTitle: lessonFound.moduleTitle,
      description: lessonFound.description,
      contents: lessonFound.contents,
      style_partial: "css_content",
      leftmenu_partial: "html_lessonMenu",
    });
  })
  .post(async (req, res) => {
    //Launch lesson
    try {
      req.params.id = validation.checkId(req.params.id, "Id URL Param");
    } catch (e) {
      return res
        .status(400)
        .render("error", { error: "Unknown url id param", title: "Error" });
    }

    const lessonFound = await lessonsData.getLessonById(req.params.id);
    let userId = req.session.sessionId;
    let lessonId = req.params.id;
    usersData.addLesson(userId, lessonId, "learned");
  });

router
  .route("/newlesson")
  //new lesson form
  .get(async (req, res) => {
    try {
      return res.status(200).render("lesson/newlesson", {
        title: "Create Lesson",
        style_partial: "css_content",
        leftmenu_partial: "html_lessonMenu",
        //script_partial: "lesson",//ERROR HERE?
      });
    } catch (e) {
      return res.status(500).json({ Error: e });
    }
  })
  .post(async (req, res) => {
    // const { lessonTitle, description, moduleTitle, text, videoLink } = req.body;

    let moduleTitle = xss(req.body.moduleTitle);
    let lessonTitle = xss(req.body.lessonTitle);
    let subject = xss(req.body.subject);
    let description = xss(req.body.description);
    let text = xss(req.body.text);
    let videoLink = xss(req.body.videoLink);
    let handle = xss(req.session.user.handle);
    let userId = req.session.sessionId;
    // let moduleTitle = req.body.contents.moduleTitle;
    // let text = req.body.contents.text;
    // let videoLink = req.body.contents.videoLink;

    try {
      const content = [
        {
          moduleTitle,
          subject,
          text,
          videoLink,
          order: 1,
        },
      ];

      let lesson = await lessonsData.createLesson(
        lessonTitle,
        subject,
        description,
        content,
        moduleTitle,
        text,
        videoLink,
        handle
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

      const { _id } = lesson;
      const lessonId = _id.toString();

      const addedToUser = await usersData.addLesson(
        req.session.sessionId,
        lessonId,
        "created"
      );
      if (!addedToUser) throw "Could not add Lesson to user on create lesson.";

      lesson = await lessonsData.getLessonById(lessonId);

      return res.status(200).render("lesson/publish", {
        title: "Publish Lesson",
        order: lesson.contents.length + 1,
        lessonTitle,
        lessonId,
        subject,
        lesson,
        style_partial: "css_content",
        leftmenu_partial: "html_lessonMenu",
        script_partial: "lesson",
        title: "Create Lesson",
      });
    } catch (error) {
      //console.log(error);
      return res.status(400).render(`lesson/newlesson`, {
        title: "Creating lesson failed",
        pageTitle: "Oops, Try again",
        subject,
        error: error,
        hasErrors: true,
        lessonTitle,
        description: description,
        moduleTitle,
        text: text,
        videoLink,
        style_partial: "css_content",
        leftmenu_partial: "html_lessonMenu",
      });
    }

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
    //   .render("error", { error: "Internal Server Error", title: "Error" });
  });

router
  .route("/addmodule/:id")
  .get(async (req, res) => {
    let lessonId = validation.checkId(xss(req.params.id));
    let lesson;
    try {
      lesson = await lessonsData.getLessonById(lessonId);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
    let subject = lesson.subject;
    let lessonTitle = lesson.lessonTitle;
    let contents = lesson.contents;
    let order;
    if (contents) {
      order = contents.length + 1;
    } else {
      order = 1;
    }

    return res.status(200).render("lesson/publish", {
      title: "Publish Lesson",
      order: order,
      lessonTitle,
      lessonId,
      subject,
      contents,
      lesson,
      style_partial: "css_content",
      leftmenu_partial: "html_lessonMenu",
      script_partial: "lesson",
    });
  })
  .post(async (req, res) => {
    //   let { lessonId, moduleTitle, text, videoLink, order } = req.body;

    let moduleTitle = xss(req.body.moduleTitle);
    let text = xss(req.body.text);
    let videoLink = xss(req.body.videoLink);
    let lessonId = xss(req.body.lessonId);
    let order = xss(req.body.order);

    let errors = [];
    try {
      moduleTitle = validation.checkContent(
        moduleTitle,
        "module Title",
        3,
        250
      );
    } catch (e) {
      errors.push(e);
    }

    order = parseInt(order);
    try {
      const response = await lessonsData.createModule(
        lessonId,
        order,
        moduleTitle,
        text,
        videoLink
      );
      const lesson = await lessonsData.getLessonById(lessonId);

      //console.log("response: " + response);
      const newOrder = lesson.contents.length + 1;

      return res.json({
        updated: true,
        title: "Publish Lesson",
        moduleTitle: moduleTitle,
        lessonId: lessonId,
        text: text,
        order: order,
        newOrder: newOrder,
        videoLink: videoLink,
        style_partial: "css_content",
        leftmenu_partial: "html_lessonMenu",
      });
    } catch (error) {
      return res.status(400).json({
        title: "Edit Lesson",
        errors: error,
        order: order,
        hasErrors: true,
        moduleTitle: "",
        text: "",
        videoLink: "",
        style_partial: "css_content",
        leftmenu_partial: "html_lessonMenu",
      });
    }
  });

router.route("published/:id").get(async (req, res) => {
  const lessonId = req.params.id;
  const lesson = await lessonsData.getLessonById(lessonId);

  res.render("lesson/lessonById", {
    title: "Lesson Published!",
    lesson,
    lessonId,
    style_partial: "css_content",
    leftmenu_partial: "html_lessonMenu",
  });
});
// .post(async (req, res) => {
//   // if (!req.session.authenticated) {

//   //   return res.redirect("/user/login");
//   // }

//   let lessonId = xss(req.params.id);

//   let moduleTitle = xss(req.body.contents.moduleTitle);
//   let text = xss(req.body.contents.text);
//   let videoLink = xss(req.body.contents.videoLink);
//   let errors = [];
//   let createdBy;

//   try {
//     moduleTitle = validation.checkContent(
//       moduleTitle,
//       "lesson title",
//       3,
//       250
//     );
//   } catch (e) {
//     errors.push(e);
//   }
//   try {
//     text = validation.checkContent(text, "lesson title", 10, 250);
//   } catch (e) {
//     errors.push(e);
//   }

//   try {
//     videoLink = validation.checkString(videoLink, "lesson title");
//   } catch (e) {
//     errors.push(e);
//   }

//   req.session.user.role == "admin"
//     ? createdBy == "admin"
//     : createdBy == "user";

//   if (errors.length > 0) {
//     return res.status(400).render("lesson/publish", {
//       title: "Error Publishing - Try Again",
//       errors: errors,
//       hasErrors: true,
//       moduleTitle: moduleTitle,
//       text: text,
//       videoLink: videoLink,
//       style_partial: "css_content",
//       script_partial: "lesson",
//     });
//   }

//   //call data function
//   try {
//     const newlesson = await lessonsData.createModule(
//       lessonId,
//       order,
//       moduleTitle,
//       text,
//       videoLink
//     );

//     const addedToUserAgain = await usersData.addLesson(
//       req.session.sessionId,
//       lessonId,
//       "learned"
//     );

//     if (!addedToUserAgain)
//       throw "Could not add Lesson to user on launch lesson.";
//     //if successful, go to user profile page to show lesson there
//     return res.status(200).redirect("/user/user");
//   } catch (e) {
//     errors.push(e);
//     return res.status(400).render("lesson/publish", {
//       title: "Edit Lesson",
//       errors: errors,
//       hasErrors: true,
//       moduleTitle: moduleTitle,
//       text: text,
//       videoLink: videoLink,
//       style_partial: "css_content",
//       script_partial: "lesson",
//     });
//   }
//   res
//     .status(500)
//     .render("error", { error: "Internal Server Error", title: "Error" });
// });

router.route("/error").get(async (req, res) => {
  //code here for GET
  return res.render("error", {
    title: "Error",
    error: "You do not have access.",
  });
});

router.route("/remove/:id").get(async (req, res) => {
  let userId = xss(req.session.sessionId);
  let lessonId = xss(req.params.id);

  try {
    if (xss(req.session.user.role) !== "admin")
      throw "User does not have access to delete this lesson.";

    const lesson = await lessonsData.getLessonById(lessonId);

    if (userId !== lesson.creatorId.toString()) {
      userId = lesson.creatorId.toString();
    }

    const deleted = await lessonsData.removeLesson(lessonId);
    if (deleted.deleted !== true) {
      throw "";
    }

    if (await usersData.deleteLesson(userId, lessonId)) {
      return res.status(200).redirect("/user/user");
    }
  } catch (e) {
    return res
      .status(400)
      .render("error", { error: "Error deleting lesson " + e, title: "Error" });
  }
});
export default router;
