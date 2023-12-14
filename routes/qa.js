import { qa } from '../config/mongoCollections.js';
import qaMethods from '../data/qa.js';
import lessonMethods from '../data/lessons.js';
import validation from '../data/validation.js';
import { Router, text } from 'express';
const router = Router();
import express from 'express';
const app = express();

router.route('/').get(async (req, res) => {
  let admin = false;
  let user = false;
  let creatorQuestions;
  let lessonQuestions;
  let recentQaArray;
  try {
    if (req.session.authenticated) {
      user = true;
      const userId = req.session.sessionId;
      creatorQuestions = await qaMethods.getRecentQAsByCreator(userId);

      if (req.session.user.role === 'admin') {
        admin = true;
        lessonQuestions = await qaMethods.getRecentQAsByLessonCreator(userId);
      }
    }

    recentQaArray = await qaMethods.getRecentQAs();
    res.render('qa/home', { recentQaArray, creatorQuestions, lessonQuestions, admin, user });
  } catch (e) {
    let error = e.message;
    res.status(500).render('error', { title: error, error });
  }
});


router
  .route('/:id')
  .get(async (req, res) => {
    // VIEWING QA
    let qaTarget;
    let error;
    let qaId;
    let owner = false;
    let admin = false;
    let lessonCreatorId;
    try {
      qaId = validation.checkId(req.params.id, 'QA ID');
    } catch (e) {
      error = e.message;
      return res.status(400).render('qa/view', {
        title: 'Invalid Lesson ID?',
        error,
        admin,
        owner,
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
      return res
        .status(404)
        .render('qa/view', { title: 'No QA found!', qaTarget, admin });
    }
    if (req.session.user){
      try {
        const lessonRelatedId = await lessonMethods.getLessonById(qaTarget.lessonId);
        lessonCreatorId = lessonRelatedId.creatorId;
        }
        catch(e) {
          error = e.message;
          return res.status(500).render('error', error);
        }
        if (req.session.user.role === 'admin' && creatorId === lessonCreatorId) {
          admin = true;
        } else {
          admin = false;
        }

      if (req.session.user.sessionId === qaTarget.creatorId.toString()) {
        owner = true;  
      }
    }
    return res
      .status(200)
      .render('qa/view', { title: qaTarget.title, qaTarget, admin, owner });
  })
  .delete(async (req, res) => {
    //DELETING QA
    let error;
    let qaId = req.params.id;
    let owner;
    let admin;
    let qaTarget;
    let lessonCreatorId;
    const creatorId = req.session.user.sessionId;

    try {
      qaTarget = await qaMethods.getQa(qaId);
    } catch (e) {
      return res.status(500).render('error', error);
    }
    try {
      const lessonRelatedId = await lessonMethods.getLessonById(qaTarget.lessonId);
      lessonCreatorId = lessonRelatedId.creatorId;
      }
      catch(e) {
        error = e.message;
        return res.status(500).render('error', error);
      }
      if (req.session.user.role === 'admin' && creatorId === lessonCreatorId) {
        admin = true;
      } else {
        admin = false;
      }
    if (creatorId === qaTarget.creatorId.toString()) {
      owner = true;
    } else {
      owner = false;
    }
    if (owner === false && admin === false) {
      return res.status(403).render('qa/view', {
        title: 'FORBIDDEN',
        qaTarget,
        admin,
        owner,
      });
    }
    try {
      await qaMethods.deleteQA(qaId, creatorId, admin);
    } catch (e) {
      let error = e.message;
      if (error === 'NP') {
        return res.status(403).render('qa/view', {
          title: 'FORBIDDEN',
          qaTarget,
          admin,
          owner,
        });
      }
      return res.status(500).render('error', { title: error, error });
    }
  });
router
  .route('/:id/answers')
  .get(async (req, res) => {})
  .post(async (req, res) => {
    //CREATING ANSWER
    let error;
    let qaTarget;
    let owner;
    let admin;
    let lessonCreatorId;
    let qaId = req.params.id;
    let creatorId = req.session.user.sessionId;
    let text = req.body.replyText;
    try {
      qaTarget = await qaMethods.getQa(qaId);
    } catch (e) {
      return res.status(500).render('error', error);
    }
    try { //rendering purpose only
      const lessonRelatedId = await lessonMethods.getLessonById(qaTarget.lessonId);
      lessonCreatorId = lessonRelatedId.creatorId;
      }
      catch(e) {
        error = e.message;
        return res.status(500).render('error', error);
      }
      if (req.session.user.role === 'admin' && creatorId === lessonCreatorId) {
        admin = true;
      } else {
        admin = false;
      }
    try {
      qaId = validation.checkId(qaId, 'QA ID');
      creatorId = validation.checkId(creatorId, 'creator ID');
      text = validation.checkString(text, 'Answer text');
    } catch (e) {
      error = e.message;
      return res
        .status(400)
        .render('qa/view', { title: 'Error', qaTarget, error, admin, owner });
    }
    if (text.length < 15 || text.length > 10000) {
      error =
        'Answer length should be at least 15 characters and not absurdly long';
      return res
        .status(400)
        .render('qa/view', { title: 'Error', qaTarget, error, admin, owner });
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
    if (creatorId === qaTarget.creatorId.toString()) {
      //rendering purposes only
      owner = true;
    } else {
      owner = false;
    }
    return res
      .status(200)
      .render('qa/view', { title: qaTarget.title, qaTarget, admin, owner });
  })
  .put(async (req, res) => {
    // Handle updating a reply
    // ...
  });
router
  .route('/:id/answers/:aId')
  .post(async (req, res) => {
    //VOTING
    let qaTarget;
    let owner;
    let admin;
    let lessonCreatorId;
    const qaId = req.params.id;
    const answerId = req.params.aId;
    const voterId = req.session.user.sessionId;
    try {
      const lessonRelatedId = await lessonMethods.getLessonById(qaTarget.lessonId);
      lessonCreatorId = lessonRelatedId.creatorId;
      }
      catch(e) {
        error = e.message;
        return res.status(500).render('error', error);
      }
      if (req.session.user.role === 'admin' && creatorId === lessonCreatorId) {
        admin = true;
      } else {
        admin = false;
      }
    try {
      await qaMethods.iqPoint(qaId, voterId, answerId);
    } catch (e) {
      let error = e.message;
      return res.status(500).render('error', { title: error, error });
    }
    try {
      qaTarget = await qaMethods.getQa(qaId);
    } catch (e) {
      return res.status(500).render('error', error);
    }
    if (voterId === qaTarget.creatorId.toString()) {
      //rendering purposes only
      owner = true;
    } else {
      owner = false;
    }
    return res
      .status(200)
      .render('qaView', { title: qaTarget.title, qaTarget, admin, owner });
  })
  .delete(async (req, res) => {
    //DELETING AN ANSWER
    let qaTarget;
    let answerTarget;
    const creatorId = req.session.user.sessionId;
    const qaId = req.params.id;
    const commentId = req.params.aId;
    let owner;
    let answerOwner;
    let admin;
    let lessonCreatorId;
    try {
      qaTarget = await qaMethods.getQa(qaId);
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    try {
    const lessonRelatedId = await lessonMethods.getLessonById(qaTarget.lessonId);
    lessonCreatorId = lessonRelatedId.creatorId;
    }
    catch(e) {
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
    if (creatorId === answerTarget.creatorId.toString()) {
      //check Answer ownership for purpose of allowing to delete
      answerOwner = true;
    } else {
      answerOwner = false;
    }
    if (creatorId === qaTarget.creatorId.toString()) {
      //check QA ownership for purpose of re-rendering with ownership
      owner = true;
    } else {
      owner = false;
    }
    if (answerOwner === false && admin === false) {
      return res.status(403).render('qa/view', {
        title: 'FORBIDDEN',
        qaTarget,
        admin,
        owner,
      });
    }
    try {
      await qaMethods.deleteAnswer(qaId, commentId, creatorId, admin);
    } catch (e) {
      let error = e.message;
      if (error === 'NP') {
        return res.status(403).render('qa/view', {
          title: 'FORBIDDEN',
          qaTarget,
          admin,
          owner,
        });
      }
      return res.status(500).render('error', { title: error, error });
    }
    return res
      .status(200)
      .render('qa/view', { title: qaTarget.title, qaTarget, admin, owner });
  });

router
  .route('/create/:lessonId')
  .get(async (req, res) => {
    //CREATE QA WEBPAGE- CHRISTINE PUT href link to /qa/create/{{lessonId}} to create an Q&A based off lesson
    try {
      originLesson = await lessonMethods.getLessonById(lessonId);
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    return res.status(200).render('qa/create', { originLesson });
  })
  .post(async (req, res) => {
    //CREATE QA DB SIDE
    let admin;
    let title;
    let originLesson;
    let lessonId;
    let contentId;
    let creatorId;
    let newQaId;
    try {
      originLesson = await lessonMethods.getLessonById(lessonId);
    } catch (e) {
      error = e.message;
      return res.status(500).render('error', error);
    }
    try {
      text = validation.checkString(req.body.qaText);
      title = validation.checkString(req.body.qaTitle);
      lessonId = validation.checkId(req.body.lessonId);
      contentId = validation.checkId(req.body.contentId);
      creatorId = validation.checkId(req.session.user.sessionId);
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
