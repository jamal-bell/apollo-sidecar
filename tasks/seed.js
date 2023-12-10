import { MongoExpiredSessionError } from "mongodb";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import userData from "../data/users.js";
import qaData from "../data/qa.js";
import lessonData from "../data/lessons.js";

const db = await dbConnection();
//await db.dropDatabase();

let newUser = undefined;
let newlesson = undefined;
let newQaPost = undefined;
let newQaResponse = undefined;



//-----------------Create Lessons---------------------//

// try {
//   for (let i = 1; i < 4; i++) {
//     let newLesson = await lessonData.createLesson(
//       "JavaScript: Lesson " + i,
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

// try {
//   let firstLesson = await lessonData.getLessonById("65732a03793ff6fd82b82acf")
//   console.log(firstLesson);
// } catch (e) {
//   console.log(e);
// }

// try {
//   let anotherLesson = await lessonData.getLessonByTitle("JavaScript: Lesson 1")
//   console.log(anotherLesson);
// } catch (e) {
//   console.log(e);
// }

// try {
//   const newModule = await lessonData.createModule(
//     "6574eb035458b7cde4ca1b81",
//     1,
//     "Arrays JS 1",
//     "Arrays are like lists...",
//     "https://www.youtube.com/watch?v=yourVideoId"
//   );
// } catch (e) {
//   console.log(e);
// }

// try {
//   const newModule = await lessonData.createModule(
//     "6574eb035458b7cde4ca1b84",
//     "",
//     "Lesson 2 new Module",
//     "Arrays are like lists...",
//     "https://www.youtube.com/watch?v=yourVideoId"
//   );
// } catch (e) {
//   console.log(e);
// }

// try {
//   const alllessons = await lessonData.getAllLessons();
//   console.log(alllessons);
// } catch (e) {
//   console.log(e);
// }

try {
  let mistakeLesson = await lessonData.removeLesson("6574eb035458b7cde4ca1b81")
} catch (e) {
  console.log(e);
}

// try {
//   let correctedLesson = await lessonData.updateLesson(
//     "6574eb035458b7cde4ca1b81",
//     "UPDATED JavaScript: Lesson ",
//     "UPDATED Data Structures: "
//   );
//   console.log(correctedLesson);
// } catch (e) {
//   console.log("Caught an error updating lesson from seed!");
//   console.log(e);
// }

// try {
//   let correctedLesson = await lessonData.updateModule(
//     "6574eb035458b7cde4ca1b84",
//     "6574eb035458b7cde4ca1b82",
//     "",
//     "Changed Module",
//     "UPDATED this module to make some changes: ",
//     "same video link"
//   );
//   console.log(correctedLesson);
// } catch (e) {
//   console.log("Caught an error updating lesson from seed!");
//   console.log(e);
// }

await closeConnection();

// Example to loop and seed database

// try {
//   for (let i = 0; i < 20; i++) {
//   newUser = await userData.create(
//     "Patrick's" + i + "Big End of Summer BBQ",
//     "Come join us for our yearly end of summer bbq!",
//     { streetAddress: "1 Castle Point Terrace", city: "Hoboken", state: "NJ", zip: "07030" },
//     "phillip123@stevens.edu",
//     30,
//     0,
//     "08/25/2024",
//     "10:00 PM",
//     "11:10 PM",
//     false
//   );
// }
//   console.log(newUser);
// } catch (e) {
//   console.log("Got an error!");
//   console.log(e);
// }

// ADD for a new QA post

// Add for new QA responses