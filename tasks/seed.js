import { MongoExpiredSessionError, ObjectId } from 'mongodb';
import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import bcrypt from 'bcryptjs';
const db = await dbConnection();
await db.dropDatabase();
import { users } from '../config/mongoCollections.js';
import { lessons } from '../config/mongoCollections.js';
const saltRounds = 10;
//-----------------Create Users---------------------//
const userCollection = await users();
const userSeedData = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    emailAddress: 'alice.j@example.com',
    role: 'admin',
    password: bcrypt.hashSync('apple1A!', saltRounds),
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    emailAddress: 'bob.smith@example.com',
    role: 'user',
    password: bcrypt.hashSync('banana2B!', saltRounds),
  },
  {
    firstName: 'Charlie',
    lastName: 'Brown',
    emailAddress: 'charlie.b@example.com',
    role: 'admin',
    password: bcrypt.hashSync('cherry3C!', saltRounds),
  },
  {
    firstName: 'David',
    lastName: 'Miller',
    emailAddress: 'david.m@example.com',
    role: 'user',
    password: bcrypt.hashSync('date4D!', saltRounds),
  },
  {
    firstName: 'Emma',
    lastName: 'Taylor',
    emailAddress: 'emma.t@example.com',
    role: 'admin',
    password: bcrypt.hashSync('elephant5E!', saltRounds),
  },
  {
    firstName: 'Frank',
    lastName: 'Wilson',
    emailAddress: 'frank.w@example.com',
    role: 'user',
    password: bcrypt.hashSync('frog6F!', saltRounds),
  },
  {
    firstName: 'Grace',
    lastName: 'Anderson',
    emailAddress: 'grace.a@example.com',
    role: 'admin',
    password: bcrypt.hashSync('grape7G!', saltRounds),
  },
  {
    firstName: 'Henry',
    lastName: 'Clark',
    emailAddress: 'henry.c@example.com',
    role: 'user',
    password: bcrypt.hashSync('horse8H!', saltRounds),
  },
  {
    firstName: 'Ivy',
    lastName: 'Robinson',
    emailAddress: 'ivy.r@example.com',
    role: 'admin',
    password: bcrypt.hashSync('icecream9I!', saltRounds),
  },
  {
    firstName: 'Jack',
    lastName: 'Moore',
    emailAddress: 'jack.m@example.com',
    role: 'user',
    password: bcrypt.hashSync('jacket10J!', saltRounds),
  },
  {
    firstName: 'Kelly',
    lastName: 'Carter',
    emailAddress: 'kelly.c@example.com',
    role: 'admin',
    password: bcrypt.hashSync('kiwi11K!', saltRounds),
  },
  {
    firstName: 'Leo',
    lastName: 'Davis',
    emailAddress: 'leo.d@example.com',
    role: 'user',
    password: bcrypt.hashSync('lemon12L!', saltRounds),
  },
  {
    firstName: 'Mia',
    lastName: 'Johnson',
    emailAddress: 'mia.j@example.com',
    role: 'admin',
    password: bcrypt.hashSync('melon13M!', saltRounds),
  },
  {
    firstName: 'Nathan',
    lastName: 'White',
    emailAddress: 'nathan.w@example.com',
    role: 'user',
    password: bcrypt.hashSync('nut14N!', saltRounds),
  },
  {
    firstName: 'Olivia',
    lastName: 'Hall',
    emailAddress: 'olivia.h@example.com',
    role: 'admin',
    password: bcrypt.hashSync('orange15O!', saltRounds),
  },
  {
    firstName: 'Paul',
    lastName: 'Baker',
    emailAddress: 'paul.b@example.com',
    role: 'user',
    password: bcrypt.hashSync('peach16P!', saltRounds),
  },
  {
    firstName: 'Quinn',
    lastName: 'Fisher',
    emailAddress: 'quinn.f@example.com',
    role: 'admin',
    password: bcrypt.hashSync('quokka17Q!', saltRounds),
  },
  {
    firstName: 'Rachel',
    lastName: 'Young',
    emailAddress: 'rachel.y@example.com',
    role: 'user',
    password: bcrypt.hashSync('rabbit18R!', saltRounds),
  },
  {
    firstName: 'Sam',
    lastName: 'Evans',
    emailAddress: 'sam.e@example.com',
    role: 'admin',
    password: bcrypt.hashSync('strawberry19S!', saltRounds),
  },
  {
    firstName: 'Tom',
    lastName: 'Hill',
    emailAddress: 'tom.h@example.com',
    role: 'user',
    password: bcrypt.hashSync('tiger20T!', saltRounds),
  },
];
await userCollection.insertMany(userSeedData);
const userIds = await userCollection
  .find()
  .map((user) => user._id)
  .toArray();
const lessonsCollection = await lessons();
const lessonTitlePrefix = 'Lesson'; // You can adjust this as needed
const newLessonInfos = Array.from({ length: 30 }, (_, index) => {
  const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
  return {
    lessonTitle: `${lessonTitlePrefix} ${index + 1}`, // Add a lesson index to the title
    description: `Description for Lesson ${index + 1}`, // Example description
    creatorId: randomUserId,
    contents: [
      {
        _id: new ObjectId(),
        order: 1,
        moduleTitle: `Module for Lesson ${index + 1}`, // Example module title
        creatorId: randomUserId,
        author: null,
        text: `Text for Lesson ${index + 1}`, // Example text
        videoLink: ['https://example.com/video'], // Example video link
        createdByRole: '',
      },
    ],
  };
});
await lessonsCollection.insertMany(newLessonInfos);
console.log(newLessonInfos);
await closeConnection();

// import { MongoExpiredSessionError } from "mongodb";
// import { dbConnection, closeConnection } from "../config/mongoConnection.js";
// import userData from "../data/users.js";
// import qaData from "../data/qa.js";
// import lessonsData from "../data/lessons.js";


// const db = await dbConnection();
// await db.dropDatabase();

// let newUser = undefined;
// let newLesson = undefined;
// let newQaPost = undefined;
// let newQaResponse = undefined;

// //-----------------Create Users---------------------//
// // try {
// //   newUser = await users.registerUser(
// //     "Haonan",
// //     "Guan",
// //     "guanhn1214@gmail.com",
// //     "qwe123QWE!@#",
// //     "admin"
// //   );
// //   newUser = await users.registerUser(
// //     "Apollo",
// //     "Sidecar",
// //     "hguan6@stevens.edu",
// //     "qwe123QWE!@#",
// //     "user"
// //   );
// // } catch (e) {
// //   console.log("Got an error!");
// //   console.log(e);
// // }

// //-----------------Create Lessons---------------------//

// try {
//   for (let i = 1; i < 4; i++) {
//     newLesson = await lessonsData.createLesson(
//       "Lesson " + i + ": JavaScript",
//       "Data Structures: " + i,
//       [
//         {
//           moduleTitle: i + " Intro to Data Structures",
//           text: "This is an intro to Data Structures.",
//           videoLink: "https://www.youtube.com/watch?v=yourVideoId",
//         },
//       ]
//     );
//   }
//   //console.log(newLesson);
// } catch (e) {
//   console.log("Caught an error creating lesson from seed!");
//   console.log(e);
// }

// // try {
// //   let firstLesson = await lessonsData.getLessonById("65732a03793ff6fd82b82acf")
// //   console.log(firstLesson);
// // } catch (e) {
// //   console.log(e);
// // }

// // try {
// //   let anotherLesson = await lessonsData.getLessonByTitle("JavaScript: Lesson 1")
// //   console.log(anotherLesson);
// // } catch (e) {
// //   console.log(e);
// // }

// // try {
// //   const newModule = await lessonsData.createModule(
// //     "6574eb035458b7cde4ca1b81",
// //     1,
// //     "Arrays JS 1",
// //     "Arrays are like lists...",
// //     "https://www.youtube.com/watch?v=yourVideoId"
// //   );
// // } catch (e) {
// //   console.log(e);
// // }

// // try {
// //   const newModule = await lessonsData.createModule(
// //     "6574eb035458b7cde4ca1b84",
// //     "",
// //     "Lesson 2 new Module",
// //     "Arrays are like lists...",
// //     "https://www.youtube.com/watch?v=yourVideoId"
// //   );
// // } catch (e) {
// //   console.log(e);
// // }

// // try {
// //   const alllessons = await lessonsData.getAllLessons();
// //   console.log(alllessons);
// // } catch (e) {
// //   console.log(e);
// // }

// // try {
// //   let mistakeLesson = await lessonsData.removeLesson("6574eb035458b7cde4ca1b81")
// // } catch (e) {
// //   console.log(e);
// // }

// // try {
// //   let correctedLesson = await lessonsData.updateLesson(
// //     "6574eb035458b7cde4ca1b81",
// //     "UPDATED JavaScript: Lesson ",
// //     "UPDATED Data Structures: "
// //   );
// //   console.log(correctedLesson);
// // } catch (e) {
// //   console.log("Caught an error updating lesson from seed!");
// //   console.log(e);
// // }

// // try {
// //   let correctedLesson = await lessonsData.updateModule(
// //     "6574eb035458b7cde4ca1b84",
// //     "6574eb035458b7cde4ca1b82",
// //     "",
// //     "Changed Module",
// //     "UPDATED this module to make some changes: ",
// //     "same video link"
// //   );
// //   console.log(correctedLesson);
// // } catch (e) {
// //   console.log("Caught an error updating lesson from seed!");
// //   console.log(e);
// // }

// await closeConnection();

// // Example to loop and seed database

// // try {
// //   for (let i = 0; i < 20; i++) {
// //   newUser = await userData.create(
// //     "Patrick's" + i + "Big End of Summer BBQ",
// //     "Come join us for our yearly end of summer bbq!",
// //     { streetAddress: "1 Castle Point Terrace", city: "Hoboken", state: "NJ", zip: "07030" },
// //     "phillip123@stevens.edu",
// //     30,
// //     0,
// //     "08/25/2024",
// //     "10:00 PM",
// //     "11:10 PM",
// //     false
// //   );
// // }
// //   console.log(newUser);
// // } catch (e) {
// //   console.log("Got an error!");
// //   console.log(e);
// // }

// // ADD for a new QA post

// // Add for new QA responses----------------------------------


