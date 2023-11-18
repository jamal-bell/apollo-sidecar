import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "./validation.js";

let exportedLessonsMethods = {
  //TODO: add input validation

  //TODO: await users() to get all users to prevent creating duplicate users

  async createUser(firstName, lastName, emailAddress, password, role) {
    firstName = validation.checkString(firstName, "First Name");
    lastName = validation.checkString(lastName, "Last Name");
    emailAddress = validation.checkEmail(emailAddress);
    password = validation.checkPassword(password);
    if (role !== "admin" || role !== "user")
      throw "Role can only be admin or user.";
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
  }, //end newUser()
  async getAllUsers() {
    const usersCollection = await users();
    const usersList = await usersCollection.find({}).toArray();
    if (!usersList) throw "Could not get all events.";
    return usersList;
  }, //end getAllUsers()
  async getUserById(id) {
    id = validation.checkId(id);
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw "User not found";
    return user;
  }, //end getUserById()
  async removeUser(id) {
    id = validation.checkId(id);
    const usersCollection = await users();
    const deletionInfo = await usersCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletionInfo) throw `Could not delete user with id of ${id}`;

    return { emailAddress: deletionInfo.emailAddress, deleted: true };
  }, //end removeUser()
  async update(userId, firstName, lastName, emailAddress, password, role) {
    userId = validation.checkId(userId);
    lastName = validation.checkString(lastName, "Last Name");
    emailAddress = validation.checkEmail(emailAddress);
    password = validation.checkPassword(password);
    if (role !== "admin" || role !== "user")
      throw "Role can only be admin or user.";
  },
}; //end createUser()
