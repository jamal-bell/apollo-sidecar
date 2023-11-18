import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "./validation.js";

const createUser = async () => {
  //TODO: add input validation

  //TODO: await users() to get all users to prevent creating duplicate users

  const newUser = async (firstName, lastName, emailAddress, password, role) => {
    // "email": "string",
    // "firstName": "string",
    // "lastName": "string",
    // "handle": "string",
    // "password": "string",
    // "github": "string",
    // "lastIp": "string",
    // "loggedInCount": 123,
    // "createdAt": "timestamp",
    // "updatedAt": "timestamp",
    // "lastLogin": "timestamp",
    // "isLoggedin": true,
    // "isAdmin": true,
    // "isActive": true,
    // "permissions": {
    //   "lessonAuth": {
    //     "edit": true,
    //     "Delete": true,
    //     "Publish": true
    //   },
    //   "learningAuth": {
    //     "edit": true,
    //     "publish": true
    //   },
    //   "qaAuth": {
    //     "post": true,
    //     "edit": true,
    //     "comment_vote": true
    //   }
    // },
    const saltRounds = 16;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      emailAddress: emailAddress,
      password: hashedPassword,
      role: role,
    };

    const usersCollection = await users();
    const insertInfo = await usersCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw "Could not add event.";
    await usersCollection.updateOne(
      { _id: insertInfo.insertedId },
      {
        $set: {
          lessons: [],
          qas: [],
        },
      }
    );
  }; //end newUser()
}; //end createUser()
