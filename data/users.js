import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "../data/validation.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
import { create } from "express-handlebars";

function checkRole(role) {
  if (!role) throw "You must provide the role.";
  if (typeof role !== "string" || role.trim().length === 0)
    throw "Role must be valid strings.";
  role = role.trim().toLowerCase();
  if (role !== "admin" && role !== "user")
    throw "Role can only be admin or user.";
  return role;
}

const saltRounds = 10;

const exportedusersMethods = {
  //TODO: add input validation
  //TODO: await users() to get all users to prevent creating duplicate users

  async registerUser(
    firstName,
    lastName,
    emailAddress,
    handle,
    password,
    role
  ) {
    firstName = validation.checkString(firstName, "First Name");
    lastName = validation.checkString(lastName, "Last Name");
    emailAddress = validation.checkEmail(emailAddress);
    password = validation.checkPassword(password);
    role = checkRole(role);
    handle = validation.checkHandle(handle);

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const timestamp = new Date();

    const usersCollection = await users();

    const checkEmail = await usersCollection.findOne({
      emailAddress: emailAddress,
    });
    const checkHandle = await usersCollection.findOne({ handle: handle });
    if (checkEmail) throw "Email already exist.";
    if (checkHandle) throw "Handle is already used, try another one.";

    const completedLessonId = [];
    const inProgressLessonId = [];
    const createdLessonId = [];
    const currentLesson = [];
    const questions = [];
    const answers = [];
    const votes = [];

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      emailAddress: emailAddress,
      password: hashedPassword,
      role: role,
      photo: "/public/assets/no-photo.jpg",
      handle: handle,
      github: "",
      lastIp: "",
      bio: "",
      loggedInCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastLogin: "timestamp",
      isLoggedin: false,
      isAdmin: role === "admin" ? true : false,
      isActive: true,
      permissions: {
        lessonAuth: {
          edit: role === "admin" ? true : false,
          Delete: role === "admin" ? true : false,
          Publish: role === "admin" ? true : false,
          addVideo: true,
        },
        learningAuth: {
          edit: role === "admin" ? true : false,
          publish: role === "admin" ? true : false,
        },
        qaAuth: {
          post: true,
          edit: true,
          comment_vote: true,
        },
      },
      progress: {
        lessonsTaken: 0,
        lessonsComplete: 0,
        lessonCreated: 0,
        voteCount: 0,
        qaAnswerCount: 0,
        qaQuestionCount: 0,
        completedLessonId: completedLessonId,
        inProgressLessonId: inProgressLessonId,
        createdLessonId: createdLessonId,
        currentLesson: currentLesson,
        qaPlatform: {
          iqPoints: 0,
          questions: questions,
          answers: answers,
          votes: votes,
        },
      },
    };

    const insertInfo = await usersCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw "Could not register user.";

    return { insertedUser: true };
  }, //end newUser()

  async loginUser(emailAddress, password) {
    emailAddress = emailAddress.trim().toLowerCase();
    password = password.trim();

    emailAddress = validation.checkEmail(emailAddress);
    password = validation.checkPassword(password);

    const usersCollection = await users();
    const user = await usersCollection.findOne({ emailAddress: emailAddress });
    if (!user) throw "User not found in the system.";

    const compareToMatch = await bcrypt.compare(password, user.password);

    if (!compareToMatch) throw "Email address and the password do not match.";

    let ip = "";

    // fetch("https://api.ipify.org?format=json")
    //   .then((response) => response.json())
    //   .then((data) => {
    //     ip = data.ip;
    //   })
    //   .catch((error) => {
    //     console.log("Error:", error);
    //   });

    let loggedCount = user.loggedInCount + 1;

    const updatedInfo = {
      lastLogin: new Date(),
      isLoggedin: true,
      loggedInCount: loggedCount,
    };

    const updatedUser = await usersCollection.findOneAndUpdate(
      { emailAddress: emailAddress },
      { $set: updatedInfo },
      { returnNewDocument: true }
    );
    if (!updatedUser) throw "Could not update the information successfully.";

    return this.getUserByEmail(emailAddress);
  }, //end loginUser

  async getAllUsers() {
    const usersCollection = await users();
    const usersList = await usersCollection
      .find({})
      .sort({ createdAt: 1 })
      .toArray();
    if (!usersList) throw "Could not get all events.";
    return usersList;
  }, //end getAllUsers()

  async getUserById(id) {
    id = validation.checkId(id);
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw "User not found in the system.";
    return user;
  }, //end getUserById()

  async getUserByEmail(emailAddress) {
    emailAddress = validation.checkEmail(emailAddress);
    const usersCollection = await users();
    const user = await usersCollection.findOne({ emailAddress: emailAddress });
    if (!user) throw "User not found in the system.";
    return user;
  }, //end getUserByEmail()

  async removeUser(emailAddress) {
    emailAddress = validation.checkEmail(emailAddress);
    const usersCollection = await users();
    const deletionInfo = await usersCollection.findOneAndDelete({
      emailAddress: emailAddress,
    });
    if (!deletionInfo) throw `Could not delete user with id of ${id}`;

    return { emailAddress: deletionInfo.emailAddress, deleted: true };
  }, //end removeUser()

  async updateUser(emailAddress, userObject) {
    let firstName = userObject.firstName.trim();
    let lastName = userObject.lastName.trim();
    let bio = userObject.bio.trim();
    let github = userObject.github.trim();
    let handle = userObject.handle.trim();
    let userId = userObject._id.trim();

    firstName = validation.checkString(firstName, "First Name");
    lastName = validation.checkString(lastName, "Last Name");
    emailAddress = validation.checkEmail(emailAddress);
    handle = validation.checkHandle(handle);
    userId = validation.checkId(userId);
    if (github.trim().length !== 0 && !new URL(github)) {
      throw "Invalid Github link.";
    }

    const usersCollection = await users();
    const user = await usersCollection.findOne({ emailAddress: emailAddress });
    if (!user) throw "User not found in the system.";

    const checkHandle = await usersCollection.findOne({ handle: handle });
    if (checkHandle && checkHandle._id.toString() !== userId)
      throw "Handle is already used, try another one.";

    const updatedInfo = {
      firstName: firstName,
      lastName: lastName,
      emailAddress: emailAddress,
      handle: handle,
      github: github,
      bio: bio,
      updatedAt: new Date(),
    };

    const updatedUser = await usersCollection.findOneAndUpdate(
      { emailAddress: emailAddress },
      { $set: updatedInfo },
      { returnDocument: "after" }
    );

    if (!updatedUser) throw "Could not update the information successfully.";

    return updatedUser;
  }, //end updateUser

  async comparePassword(emailAddress, password) {
    password = validation.checkPassword(password);

    const usersCollection = await users();
    const user = await usersCollection.findOne({ emailAddress: emailAddress });
    if (!user) throw "User not found in the system.";

    const compareToMatch = await bcrypt.compare(password, user.password);

    if (!compareToMatch) throw "Email address and the password do not match.";

    return password;
  }, //end comparePassword

  async updatePassword(emailAddress, newPassword) {
    newPassword = validation.checkPassword(newPassword);
    emailAddress = validation.checkEmail(emailAddress);

    const usersCollection = await users();
    const user = await usersCollection.findOne({ emailAddress: emailAddress });
    if (!user) throw "User not found in the system.";

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const updatedInfo = {
      password: hashedPassword,
      updatedAt: new Date(),
    };

    const updatedUser = await usersCollection.findOneAndUpdate(
      { emailAddress: emailAddress },
      { $set: updatedInfo },
      { returnDocument: "after" }
    );

    if (!updatedUser) throw "Could not update the information successfully.";

    return { emailAddress: emailAddress, updated: true };
  }, //end updatePassword

  async logoutUser(emailAddress) {
    emailAddress = validation.checkEmail(emailAddress);

    const usersCollection = await users();
    const user = await usersCollection.findOne({ emailAddress: emailAddress });
    const updatedInfo = {
      isLoggedin: false,
      updatedAt: new Date(),
    };

    const updatedUser = await usersCollection.findOneAndUpdate(
      { emailAddress: emailAddress },
      { $set: updatedInfo },
      { returnDocument: "after" }
    );

    if (!updatedUser) throw "Could not update the information successfully.";
    return { emailAddress: emailAddress, logout: true };
  }, //end logoutUser

  async deactiveUser(emailAddress) {
    emailAddress = validation.checkEmail(emailAddress);

    const usersCollection = await users();
    const user = await usersCollection.findOne({ emailAddress: emailAddress });
    const updatedInfo = {
      updatedAt: new Date(),
      isActive: false,
    };

    const updatedUser = await usersCollection.findOneAndUpdate(
      { emailAddress: emailAddress },
      { $set: updatedInfo },
      { returnDocument: "after" }
    );

    if (!updatedUser) throw "Could not update the information successfully.";
    return { emailAddress: emailAddress, deactivated: true };
  }, //end deactiveUser

  async reactivateUser(emailAddress) {
    emailAddress = validation.checkEmail(emailAddress);

    const usersCollection = await users();
    const user = await usersCollection.findOne({ emailAddress: emailAddress });
    const updatedInfo = {
      updatedAt: new Date(),
      isActive: true,
    };

    const updatedUser = await usersCollection.findOneAndUpdate(
      { emailAddress: emailAddress },
      { $set: updatedInfo },
      { returnDocument: "after" }
    );

    if (!updatedUser) throw "Could not update the information successfully.";
    return { emailAddress: emailAddress, deactivated: true };
  }, //end reactivateUser

  async addLesson(userId, lessonId, createdOrLearned) {
    userId = validation.checkId(userId, "userId");
    lessonId = validation.checkId(lessonId, "lessonId");
    createdOrLearned = createdOrLearned.trim().toLowerCase();

    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) throw "User not found in the system.";

    let progress = user.progress;
    process.lessonCreated = process.lessonCreated + 1;

    if (createdOrLearned === "created") {
      if (progress.createdLessonId) {
        progress.createdLessonId.push({ lessonId: lessonId });
      } else {
        lessons.created = [{ lessonId: lessonId }];
      }
    } else if (createdOrLearned === "learned") {
      if (lessons.inProgressLessonId) {
        lessons.inProgressLessonId.push({ lessonId: lessonId });
      } else {
        lessons.inProgressLessonId = [{ lessonId: lessonId }];
      }
    } else {
      throw `Invalid argument for 'createdOrLearned'. Must be either 'created' or 'learned'`;
    }
    const updatedprogress = {
      progress: progress,
      updatedAt: new Date(),
    };

    const updatedUser = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updatedprogress },
      { returnDocument: "after" }
    );

    if (!updatedUser) throw "Could not update the user successfully.";

    return true;
  },

  async updatePhoto(emailAddress, url) {
    emailAddress = validation.checkEmail(emailAddress);
    if (url.length === 0 || !new URL(url)) {
      throw "Invalid photo Link.";
    }

    const usersCollection = await users();
    const user = await usersCollection.findOne({ emailAddress: emailAddress });

    if (!user) throw "User not found in the system.";

    const updatedPhoto = {
      photo: url,
      updatedAt: new Date(),
    };

    const updatedUser = await usersCollection.findOneAndUpdate(
      { emailAddress: emailAddress },
      { $set: updatedPhoto },
      { returnDocument: "after" }
    );

    if (!updatedUser) throw "Could not update the photo successfully.";

    return updatedUser;
  },
}; //end createUser()

export default exportedusersMethods;
