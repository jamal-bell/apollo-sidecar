import { qa } from '../config/mongoCollections.js';
import qaMethods from '../data/qa.js';
import lessonMethods from '../data/lessons.js';
import validation from '../data/validation.js';
import { Router, text } from 'express';
const router = Router();
import express from 'express';
import xss from 'xss';
const app = express();

router.route('/').get(async (req, res) => {
  let admin = false;
  let user = false;
  let creatorQuestions;
  let lessonQuestions;
  let recentQaArray;
  let error;
  let loggedIn;
  try {
    if (req.session.user) {
      user = true;
      loggedIn = true;
      const userId = req.session.sessionId;
      creatorQuestions = await qaMethods.getRecentQAsByCreator(userId);

      if (req.session.user.role === 'admin') {
        admin = true;
        lessonQuestions = await qaMethods.getRecentQAsByLessonCreator(userId);
      }
    }

    recentQaArray = await qaMethods.getRecentQAs();
    res.render('qa/home', {
      recentQaArray,
      creatorQuestions,
      lessonQuestions,
      admin,
      user,
      loggedIn,
    });
  } catch (e) {
    error = e.message;
    res.status(500).render('error', { title: error, error });
  }
});

router
  .route('/:id')
  .get(async (req, res) => {
    // VIEWING QA
    let qaTarget;
    let error;
    let qaId = xss(req.params.id);
    let owner = false;
    let admin = false;
    let loggedIn = false;
    let lessonCreatorId;
    let lessonRelatedId;
    let viewSuffix = '';
    try {
      qaId = validation.checkId(qaId, 'QA ID');
    } catch (e) {
      error = e.message;
      return res.status(404).render('error', {
        title: 'Error 404: Invalid Lesson ID?',
        error,
      });
    }
    try {
      qaTarget = await qaMethods.getQa(qaId);
    } catch (e) {
      error = e.message;
      return res
        .status(500)
        .render('error', { title: 'Internal Server Error', error });
    }
    if (!qaTarget) {
      qaTarget.text = 'No QA Found :(';
      return res.status(404).render('error', { title: 'No QA found!', error });
    }
    if (req.session.user) {
      loggedIn = true;
      viewSuffix = 'User';
      try {
        lessonRelatedId = await lessonMethods.getLessonById(
          qaTarget.lessonId.toString()
        );
        lessonCreatorId = lessonRelatedId.creatorId.toString();
      } catch (e) {
        error = e.message;
        return res.status(500).render('error', error);
      }
      if (
        req.session.user.role === 'admin' &&
        req.session.sessionId === lessonCreatorId
      ) {
        admin = true;
        viewSuffix = 'Admin';
      } else {
        admin = false;
      }
    }
    return res.status(200).render(`qa/view${viewSuffix}`, {
      title: qaTarget.title,
      qaTarget,
      owner,
    });
  })
  .delete(async (req, res) => {
    //DELETING QA
    let error;
    let qaId = xss(req.params.id);
    let owner;
    let admin;
    let qaTarget;
    let lessonCreatorId;
    let loggedIn;
    let viewSuffix;
    const creatorId = req.session.sessionId;
    if (req.session.user) {
      loggedIn = true;
      viewSuffix = 'User';
    }
    try {
      qaId = validation.checkId(qaId, 'QA ID');
      qaTarget = await qaMethods.getQa(qaId);
    } catch (e) {
      return res.status(500).render('error', error);
    }
    try {
      const lessonRelatedId = await lessonMethods.getLessonById(
        qaTarget.lessonId.toString()
      );
      lessonCreatorId = lessonRelatedId.creatorId.toString();
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    if (req.session.user.role === 'admin' && creatorId === lessonCreatorId) {
      admin = true;
      viewSuffix = 'Admin';
    } else {
      admin = false;
    }
    if (creatorId === qaTarget.creatorId.toString()) {
      owner = true;
    } else {
      owner = false;
    }
    if (owner === false && admin === false) {
      return res.status(403).render(`qa/view${viewSuffix}`, {
        title: 'FORBIDDEN',
        qaTarget,
        owner,
      });
    }
    try {
      await qaMethods.deleteQA(qaId, creatorId, admin);
    } catch (e) {
      error = e.message;
      if (error === 'NP') {
        return res.status(403).render('error', {
          title: 'FORBIDDEN',
          error,
        });
      }
      return res.status(500).render('error', { title: error, error });
    }
    return res.redirect('../../');
  });
router
  .route('/:id/answers')
  .get(async (req, res) => {})
  .post(async (req, res) => {
    //CREATING ANSWER
    let error;
    let qaId = xss(req.params.id);
    let qaTarget;
    let owner;
    let admin;
    let lessonCreatorId;
    let creatorId = req.session.sessionId;
    let text;
    let loggedIn;
    let viewSuffix;
    req.session.previousUrl = req.get('referer') || '/';
    if (req.session.user) {
      loggedIn = true;
      viewSuffix = 'User';
    }
    try {
      qaId = validation.checkId(qaId, 'QA ID');
      creatorId = validation.checkId(creatorId, 'creator ID');

      qaTarget = await qaMethods.getQa(qaId);
    } catch (e) {
      return res.status(500).render('error', error);
    }
    try {
      //rendering purpose only
      const lessonRelatedId = await lessonMethods.getLessonById(
        qaTarget.lessonId.toString()
      );
      lessonCreatorId = lessonRelatedId.creatorId.toString();
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    if (req.session.user.role === 'admin' && creatorId === lessonCreatorId) {
      admin = true;
      viewSuffix = 'Admin';
    } else {
      admin = false;
    }
    try {
      text = xss(req.body.replyText);
      text = validation.checkString(text, 'Answer text');
    } catch (e) {
      error = e.message;
      return res.redirect(`http://localhost:3000/qa/${qaId}`);
    }
    if (text.length < 15 || text.length > 10000) {
      error =
        'Answer length should be at least 15 characters and not absurdly long';
      return res.redirect(`http://localhost:3000/qa/${qaId}`);
    }
    try {
      await qaMethods.createAnswer(creatorId, text, qaId);
    } catch (e) {
      return res.status(500).render('error', error);
    }
    try {
      qaTarget = await qaMethods.getQa(qaId);
    } catch (e) {
      return res.status(500).render('error', error);
    }
    return res.redirect(`http://localhost:3000/qa/${qaId}`);
  })
  .put(async (req, res) => {
    // Handle updating a reply
    // ...
  });
router
  .route('/:id/answers/:aId')
  .post(async (req, res) => {
    //VOTING
    let error;
    let qaTarget;
    let owner;
    let admin;
    let lessonCreatorId;
    let lessonRelatedId;
    let loggedIn;
    let viewSuffix;
    let qaId = xss(req.params.id);
    let answerId = xss(req.params.aId);
    let voterId = req.session.sessionId;
    req.session.previousUrl = req.get('referer') || '/';
    try {
      qaId = validation.checkId(qaId, 'QA ID');
      answerId = validation.checkId(answerId, 'answer ID');
      voterId = validation.checkId(voterId, 'voter ID');
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    try {
      qaTarget = await qaMethods.getQa(qaId);
      lessonRelatedId = await lessonMethods.getLessonById(
        qaTarget.lessonId.toString()
      );
      lessonCreatorId = lessonRelatedId.creatorId.toString();
    } catch (e) {
      return res.status(500).render('error', error);
    }
    if (req.session.user) {
      loggedIn = true;
      viewSuffix = 'User';
      if (req.session.user.role === 'admin' && voterId === lessonCreatorId) {
        admin = true;
        owner = true;
        viewSuffix = 'Admin';
      } else {
        admin = false;
      }
    }

    try {
      await qaMethods.iqPoint(qaId, voterId, answerId);
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', { title: error, error });
    }
    return res.status(200).render(`qa/view${viewSuffix}`, {
      title: qaTarget.title,
      qaTarget,
      owner,
    });
  })
  .delete(async (req, res) => {
    //DELETING AN ANSWER
    let error;
    let qaTarget;
    let answerTarget;
    const creatorId = req.session.sessionId;
    const qaId = xss(req.params.id);
    const commentId = xss(req.params.aId);
    let admin;
    let lessonCreatorId;
    let loggedIn;
    let viewSuffix;
    if (req.session.user) {
      loggedIn = true;
    }
    try {
      creatorId = validation.checkId(creatorId, 'creator ID');
      qaId = validation.checkId(qaId, 'QA ID');
      commentId = validation.checkId(commentId, 'comment ID');
      qaTarget = await qaMethods.getQa(qaId);
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    try {
      const lessonRelatedId = await lessonMethods.getLessonById(
        qaTarget.lessonId.toString()
      );
      lessonCreatorId = lessonRelatedId.creatorId.toString();
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    if (req.session.user.role === 'admin' && creatorId === lessonCreatorId) {
      admin = true;
    } else {
      admin = false;
    }
    try {
      answerTarget = await qaMethods.getAnswer(answerId);
    } catch (e) {
      return res.status(500).render('error', error);
    }
    if (!admin) {
      return res.status(403).render('qa/view', {
        title: 'FORBIDDEN',
        qaTarget,
      });
    }
    try {
      await qaMethods.deleteAnswer(qaId, commentId, creatorId, admin);
    } catch (e) {
      error = e.message;
      if (error === 'NP') {
        return res.status(403).render('qa/view', {
          title: 'FORBIDDEN',
          qaTarget,
        });
      }
      return res.status(500).render('error', { title: error, error });
    }
    return res.redirect(req.session.previousUrl);
  });

router
  .route('/create/:lessonId')
  .get(async (req, res) => {
    //CREATE QA WEBPAGE- CHRISTINE PUT href link to /qa/create/{{lessonId}} to create an Q&A based off lesson
    let error;
    let lessonId = xss(req.params.lessonId);
    let loggedIn;
    let originLesson;
    if (req.session.user) {
      loggedIn = true;
    }
    try {
      lessonId = validation.checkId(lessonId, 'Lesson ID');
      originLesson = await lessonMethods.getLessonById(lessonId);
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    return res.status(200).render('qa/create', { originLesson });
  })
  .post(async (req, res) => {
    //CREATE QA DB SIDE
    let title;
    let originLesson;
    let contentId;
    let creatorId = req.session.sessionId;
    let lessonId = xss(req.params.lessonId);
    let newQaId;
    let loggedIn;
    if (req.session.user) {
      loggedIn = true;
    }
    try {
      contentId = xss(req.body.contentId);
      lessonId = validation.checkId(lessonId, 'Lesson ID');
      contentId = validation.checkId(contentId, 'content ID');
      creatorId = validation.checkId(creatorId, 'creator ID');

      originLesson = await lessonMethods.getLessonById(lessonId);
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    try {
      text = xss(req.body.qaText);
      text = validation.checkString(text, 'main text');
      title = xss(req.body.qaTitle);
      title = validation.checkString(title, 'title text');
    } catch (e) {
      return res
        .status(400)
        .render('qa/create', { title: 'Error', originLesson });
    }
    if (text.length < 25 || text.length > 10000) {
      return res
        .status(400)
        .render('qa/create', { title: 'Error', originLesson });
    }
    if (title.length < 10 || title.length > 50) {
      return res
        .status(400)
        .render('qa/create', { title: 'Error', originLesson });
    }
    try {
      newQaId = await qaMethods.createQa(
        title,
        creatorId,
        lessonId,
        contentId,
        text
      );
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    return res.redirect(`/${newQaId}`);
  });

export default router;
