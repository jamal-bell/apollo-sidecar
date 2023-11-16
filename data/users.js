import {users} from "../config/mongoCollections.js";
import {ObjectId} from "mongodb";
import validation from validation.js;

const createUser = async () => {
  //TODO: add input validation

  //TODO: await users() to get all users to prevent creating duplicate users

  const newUser = {
    _id: newObjectId(),
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "handle": "string",
    "password": "string",
    "github": "string",
    "lastIp": "string",
    "loggedInCount": 123,
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "lastLogin": "timestamp",
    "isLoggedin": true,
    "isAdmin": true,
    "isActive": true,
    "permissions": {
      "lessonAuth": {
        "edit": true,
        "Delete": true,
        "Publish": true
      },
      "learningAuth": {
        "edit": true,
        "publish": true
      },
      "qaAuth": {
        "post": true,
        "edit": true,
        "comment_vote": true
      }
    },
    "progress": {
      "lessonsTaken": 123,
      "lessonsComplete": 123,
      "voteCount": 123,
      "qaAnswerCount": 123,
      "qaQuestionCount": 123,
      "completedLessonId": [{ "lessonId": 123 }, { "lessonId": 123 }],
      "inProgressLessonId": [{ "lessonId": 123 }, { "lessonId": 123 }],
      "currentLesson": [
        {
          "currentLessonId": 123,
          "completedSection": [{ "sectionNo": 123 }]
        },
        {
          "currentLessonId": 123,
          "completedSection": [{ "sectionNo": 123 }]
        }
      ],
      "qaPlatform": {
        "questions": [
          { "postId": 123, "questionId": 123 },
          { "postId": 123, "questionId": 123 }
        ],
        "answers": [
          { "postId": 123, "answerId": 123 },
          { "postId": 123, "answerId": 123 }
        ],
        "votes": [
          { "postId": 123, "type": "q/a" },
          { "postId": 123, "type": "q/a" }
        ]
      }
    }//end progress
  }//end newUser()
}//end createUser()