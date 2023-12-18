import { qa } from '../config/mongoCollections.js';
import { users } from '../config/mongoCollections.js';
import { lessons } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from './validation.js';
import xss from 'xss';
const exportedMethods = {
  async createQa(title, creatorId, lessonId, contentId, text) {
    try {
      title = xss(title);
      title = validation.checkString(title, 'title');
      text = xss(text);
      text = validation.checkString(text, 'body text of QA submission');
      validation;
      creatorId = validation.checkId(creatorId, 'Author ID');
      lessonId = validation.checkId(lessonId, 'Lesson ID');
      contentId = validation.checkId(contentId, 'Content ID');
      if (title.length < 10 || title.length > 50) {
        throw new Error(
          'Title must be between 10 and 50 characters, inclusive'
        );
      }
      if (text.length < 25 || text.length > 10000) {
        throw new Error(
          'Text must be at least 25 characters, and not absurdly long'
        );
      }
      const usersCollection = await users();
      const author = await usersCollection.findOne({
        _id: new ObjectId(creatorId),
      });
      if (!author) {
        throw new Error('Author not found');
      }
      const qaCollection = await qa();
      const answers = [];
      const currentDate = new Date();
      const createdAt = currentDate.getTime();
      const createdAtDate = new Date(createdAt);
      const timeStamp = createdAtDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
      const qaInserted = await qaCollection.insertOne({
        //QA START SCHEMA
        title: title, //title of the question
        text: text, //text of the question
        creatorId: new ObjectId(author._id), //author's _id
        author: author.handle, //author's handle/username
        lessonId: new ObjectId(lessonId), //which less is the QA related to?
        contentId: new ObjectId(contentId), //in the lesson, what content the lesson is this related to
        answers: answers, //answers to the QA, refer to the database proposal
        createdAt: createdAt, //timestamp - added after DB proposal
        timeStamp: timeStamp,
      }); //END SCHEMA
      let insertedId = qaInserted.insertedId;
      const newQuestion = {
        postId: new ObjectId(lessonId),
        questionId: new ObjectId(insertedId),
      };
      const qaList = author.progress.qaPlatform.questions;
      qaList.push(newQuestion);
      await usersCollection.updateOne(
        { _id: new ObjectId(creatorId) },
        { $set: { 'progress.qaPlatform.questions': qaList } }
      );
      insertedId = insertedId.toString();
      return { insertedId }; // or return some meaningful response
    } catch (e) {
      throw new Error(`Error creating QA: ${e.message}`);
    }
  },
  async deleteQA(qaId, userId, admin) {
    try {
      validation.checkId(qaId, 'QA ID');
      validation.checkId(userId, 'User ID');

      const qaCollection = await qa();
      const qaTarget = await qaCollection.findOne({ _id: new ObjectId(qaId) });
      if (!qaTarget) {
        throw new Error('QA not found');
      }
      const usersCollection = await users();
      const author = await usersCollection.findOne({
        _id: new ObjectId(qaTarget.creatorId),
      });
      if (author._id !== userId && !admin) {
        throw new Error('NP');
      }
      if (!author) {
        throw new Error('Author not found');
      }
      const result = await qaCollection.deleteOne({ _id: new ObjectId(qaId) });
      if (result.deletedCount === 0) {
        throw new Error('QA not found');
      }

      const qaList = author.progress.qaPlatform.questions.filter(
        (id) => !id.equals(new ObjectId(qaId))
      );

      await usersCollection.updateOne({
        _id: new ObjectId(creatorId),
        'progress.qaPlatform.questions': qaList,
      });
      return { title: 'QA Deleted' }; // or return some meaningful response
    } catch (e) {
      throw new Error(`Error deleting QA: ${e.message}`);
    }
  },
  async getQa(qaId) {
    let qaTarget;
    try {
      qaId = validation.checkId(qaId, 'qa Id');
      qaId = new ObjectId(qaId);
      const qaCollection = await qa();
      qaTarget = await qaCollection.findOne({ _id: qaId });
    } catch (e) {
      throw new Error('QA Not Found!');
    }
    return qaTarget;
  },
  async getAnswer(ansId) {
    let answerTarget;
    try {
      ansId = validation.checkId(ansId, 'answer ID');
      const qaCollection = await qa();
      const result = await qaCollection.findOne(
        {
          'answers._id': new ObjectId(ansId),
        },
        {
          _id: 0,
          'answers.$': 1,
        }
      );
      answerTarget = result && result.answers && result.answers[0];
    } catch (e) {
      throw new Error('Answer not Found');
    }
    return answerTarget;
  },
  async createAnswer(creatorId, text, qaId) {
    creatorId = validation.checkId(creatorId, 'Author ID');
    qaId = validation.checkId(qaId, 'QA ID');
    text = xss(text);
    text = validation.checkString(text, 'Body text');
    if (text.length < 15 || text.length > 10000) {
      throw new Error(
        'Length must be at least 15 characters, and not absurdly long'
      );
    }
    const usersCollection = await users();
    const author = await usersCollection.findOne({
      _id: new ObjectId(creatorId),
    });

    if (!author) {
      throw new Error('Author not found');
    }
    const commentId = new ObjectId();
    const currentDate = new Date();
    const createdAt = currentDate.getTime();
    const createdAtDate = new Date(createdAt);
    const timeStamp = createdAtDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    const votedUsers = [];
    const voteUserAndTime = {
      userId: author._id, //finds objectId, should not convert down to string when stored
      voteTime: timeStamp,
    };
    votedUsers.push(voteUserAndTime);
    const votes = { votedUsers: votedUsers, value: 1 };
    const qaCollection = await qa();
    const result = await qaCollection.findOneAndUpdate(
      { _id: new ObjectId(qaId) },
      {
        $push: {
          answers: {
            //BEGIN ANSWER SCHEMA
            _id: commentId, //id of the comment itself
            text: text, //text of the comment
            creatorId: author._id, //_id of the answer creator
            author: author.handle, //handle of the user
            votes: votes, //contains an (array votedUsers[] containing the user who voted, timestamp) and value
            createdAt: createdAt,
            timeStamp: timeStamp,
            locked: false, //locked - added after database proposal
          }, //END ANSWER SCHEMA
        },
      },
      {
        returnDocument: 'after',
        projection: { answers: 1 }, // Include only the 'answers' field
      }
    );
    if (result.modifiedCount === 0) {
      throw new Error('QA not found or not updated');
    }
    const result2 = await usersCollection.updateOne(
      { _id: new ObjectId(creatorId) },
      {
        $push: {
          'progress.qaPlatform.answers': {
            postId: new ObjectId(qaId),
            answerId: new ObjectId(commentId),
          },
        },
      }
    );
    if (result2.modifiedCount === 0) {
      throw new Error('User not found or not updated');
    }
    let answersTargetIndex = result.answers.length -1;
    let targetAnswer = result.answers[answersTargetIndex];
    return targetAnswer;
  },
  async deleteAnswer(qaId, answerId) {
    validation.checkId(qaId, 'QA ID');
    validation.checkId(answerId, 'comment ID');
    let replyTarget;
    let qaCollection;
    let usersCollection;

    try {
      qaCollection = await qa();
      usersCollection = await users();
    } catch(e) {
      throw new Error('Database Connection Error');
    }
    try {
      replyTarget = await this.getAnswer(answerId)
      if (!replyTarget) {
        throw new Error('reply not found');
      }
    } catch (e) {
      throw new Error(`Error deleting reply - validation: ${e.message}`);
    }
    try {
      answerId = validation.checkId(answerId);

      const result = await qaCollection.updateOne(
        { 'answers._id': new ObjectId(answerId) },
        {
          $set: {
            'answers.$.author': 'Deleted',
            'answers.$.creatorId': null,
            'answers.$.locked': true,
          },
        }
      );
      const creatorId = replyTarget.creatorId;
      const result2 = await usersCollection.updateOne(
        { _id: new ObjectId(creatorId) },
        {
          $pull: {
            'progress.qaPlatform.answers': {
              postId: new ObjectId(qaId),
              answerId: new ObjectId(answerId),
            },
          },
        }
      );
      return true;
    } catch (e) {
      throw new Error(`Error deleting reply: ${e.message}`);
    }
  },
  async iqPoint(qaId, voterId, answerId) {
    qaId = validation.checkId(qaId, 'QA ID');
    voterId = validation.checkId(voterId, 'Voter ID');
    answerId = validation.checkId(answerId, 'Answer ID');

    const qaCollection = await qa();
    const usersCollection = await users();
    const resultArray = await qaCollection
      .aggregate([
        { $match: { _id: new ObjectId(qaId) } },
        {
          $project: {
            answers: {
              $filter: {
                input: '$answers',
                as: 'answer',
                cond: { $eq: ['$$answer._id', new ObjectId(answerId)] },
              },
            },
          },
        },
      ])
      .toArray();
    const answerTarget = resultArray[0].answers[0];
    if (answerTarget.locked === true) {
      return;
    }
    const ownerOfAnswerId = answerTarget.creatorId.toString() || null;
    const voterArray = answerTarget.votes.votedUsers;
    const votersIdsOnly = voterArray.map((voter) => voter.userId.toString());
    const result = votersIdsOnly.includes(voterId);
    if (result) {
      //if they already voted
      const result1 = await qaCollection.findOneAndUpdate(
        { _id: new ObjectId(qaId), 'answers._id': new ObjectId(answerId) },
        {
          $inc: { 'answers.$.votes.value': -1 },
          $pull: {
            'answers.$.votes.votedUsers': { userId: new ObjectId(voterId) },
          },
        },
        { returnDocument: 'after' }
      );

      const result2 = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(voterId) },
        {
          $pull: {
            'progress.qaPlatform.votes': {
              postId: new ObjectId(answerId),
              type: 'q/a',
            },
          },
          $inc: { 'progress.qaPlatform.iqPoints': -1 },
        },
        { returnDocument: 'after' }
      );
      const result3 = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(ownerOfAnswerId) },
        {
          $inc: { 'progress.qaPlatform.iqPoints': -1 },
        },
        { returnDocument: 'after' }
      );
      return true;
    } else {
      //if they didn't vote
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      const result0 = await qaCollection.updateOne(
        { _id: new ObjectId(qaId), 'answers._id': new ObjectId(answerId) },
        {
          $inc: { 'answers.$.votes.value': 1 },
          $addToSet: {
            'answers.$.votes.votedUsers': {
              userId: new ObjectId(voterId),
              voteTime: timestamp,
            },
          },
        }
      );
      const result4 = await usersCollection.updateOne(
        { _id: new ObjectId(voterId) },
        {
          $push: {
            'progress.qaPlatform.votes': {
              postId: new ObjectId(answerId),
              type: 'q/a',
            },
          },
          $inc: { 'progress.qaPlatform.iqPoints': 1 },
        }
      );
      const result5 = await usersCollection.updateOne(
        { _id: new ObjectId(ownerOfAnswerId) },
        {
          $inc: { 'progress.qaPlatform.iqPoints': 1 },
        }
      );
    }
    return false;
  },
  async getRecentQAs() {
    try {
      const qaCollection = await qa();
      const recentQaArray = qaCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
      return recentQaArray;
    } catch (e) {
      throw new Error(`Database pull error: ${e.message}`);
    }
  },
  async getRecentQAsByLessonCreator(creatorId) {
    try {
      const qaCollection = await qa();
      const lessonsCollection = await lessons();
      const lessonIds = await lessonsCollection
        .find({ creatorId: new ObjectId(creatorId) })
        .project({ lessonId: 1, _id: 0 })
        .toArray();
      const questionPromises = lessonIds.map(async (lessonId) => {
        return qaCollection
          .find({ lessonId: lessonId })
          .sort({ createdAt: -1 })
          .limit(20)
          .toArray();
      });
      const questionsByLesson = await Promise.all(questionPromises);
      const flattenedQuestions = questionsByLesson.flat();
      return flattenedQuestions;
    } catch (e) {
      throw new Error(`Database pull error: ${e.message}`);
    }
  },
  async getRecentQAsByCreator(creatorId) {
    try {
      const qaCollection = await qa();
      const recentQuestions = await qaCollection
        .find({ creatorId: new ObjectId(creatorId) })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
      return recentQuestions;
    } catch (e) {
      throw new Error(`Database pull error: ${e.message}`);
    }
  },
};
export default exportedMethods;
