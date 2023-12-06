import { lessonsData } from "../data/index.js";
import validation from "../data/validation.js";
import express from "express";
import { Router } from "express";
const app = express();
const router = Router();

router.route("/").get(async (req, res) => {
  //list of all lessons, unrestricted
  const lessons = await lessonsData.getAllLessons();

  res.render("lessons", {
    title: "Lessons",
    //lessons: lessons,
  });
});

router
  .route("/:id")
  .get(async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/user/login");
    }
    const lesson = await lessonsData.getLessonById();
    res.render("lessons/:id", {
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
    });
  })
  .post(async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/user/login");
    }
    let title = req.body.title;
    let description = req.body.description;
    let creatorId = req.session.creator;
  });

export default router;
