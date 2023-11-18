import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "./validation.js";

//const createUser = async () => {
//TODO: add input validation

//TODO: await users() to get all users to prevent creating duplicate users

//   const newUser = {
//     _id: newObjectId(),
//     email: "string",
//     firstName: "string",
//     lastName: "string",
//     handle: "string",
//     password: "string",
//     github: "string",
//     lastIp: "string",
//     loggedInCount: 123,
//     createdAt: "timestamp",
//     updatedAt: "timestamp",
//     lastLogin: "timestamp",
//     isLoggedin: true,
//     isAdmin: true,
//     isActive: true,
//     permissions: {
//       lessonAuth: {
//         edit: true,
//         Delete: true,
//         Publish: true,
//       },
//       learningAuth: {
//         edit: true,
//         publish: true,
//       },
//       qaAuth: {
//         post: true,
//         edit: true,
//         comment_vote: true,
//       },
//     },
//   }; //end newUser()
// }; //end createUser()

const exportedMethods = {};

export default exportedMethods;
