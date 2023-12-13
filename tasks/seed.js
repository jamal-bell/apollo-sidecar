import { MongoExpiredSessionError } from "mongodb";
import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import users from "../data/users.js";
import qaData from "./data/qa.js";
import lessonData from "./lessons.js";

let newUser = undefined;
let newlesson = undefined;
let newQaPost = undefined;
let newQaResponse = undefined;

// Example to loop and seed database

try {
  newUser = await users.registerUser(
    "Haonan",
    "Guan",
    "guanhn1214@gmail.com",
    "qwe123QWE!@#",
    "admin"
  );
  newUser = await users.registerUser(
    "Apollo",
    "Sidecar",
    "hguan6@stevens.edu",
    "qwe123QWE!@#",
    "user"
  );
} catch (e) {
  console.log("Got an error!");
  console.log(e);
}

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
