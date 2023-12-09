import { lessonsData } from "../data/index.js";
import validation from "../data/validation.js";
import express from "express";
import { Router } from "express";
const app = express();
const router = Router();

router.route("/").get(async (req, res) => {
  //list of all lessons, unrestricted
  const lessons = await lessonsData.getAllLessons();

  res.render("lesson/lessons", {
    title: "Lessons",
    lessons: lessons,
  });
});

router.route("/:id").get(async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/user/login");
  }
  const lesson = await lessonsData.getLessonById();
  res.render("lesson/lessons/:id", {
    title: lesson.title,
    description: lesson.description,
    content: lesson.content,
  });
});

router
  .route("/upload")
  .get(async (req, res) => {
    return res.render("lesson/upload");
  })
  .post(async (req, res) => {
    if (!req.session.user) {
      //and admin
      return res.redirect("/user/login");
    } 
    if (req.session.user.role === "user")
      return res.render("error", {title: "Error", error: "Admin permissions are required to view this page"});

    let title = req.body.titleInput;
    let description = req.body.descriptionInput;
    let creatorId = req.session.creator;
  });

export default router;
