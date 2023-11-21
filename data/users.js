import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "../data/validation.js";

function checkRole(role) {
  if (!role) throw "You must provide the role.";
  if (typeof role !== "string" || role.trim().length === 0)
    throw "Role must be valid strings.";
  role = role.trim().toLowerCase();
  if (role !== "admin" && role !== "user")
    throw "Role can only be admin or user.";
  return role;
}

const exportedusersMethods = {
  //TODO: add input validation
  //TODO: await users() to get all users to prevent creating duplicate users

  async registerUser(firstName, lastName, emailAddress, password, role) {
    firstName = validation.checkString(firstName, "First Name");
    lastName = validation.checkString(lastName, "Last Name");
    emailAddress = validation.checkEmail(emailAddress);
    password = validation.checkPassword(password);
    role = checkRole(role);

    const saltRounds = 16;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      emailAddress: emailAddress,
      password: hashedPassword,
      role: role,
      handle: "",
      github: "",
      lastIp: "",
      loggedInCount: 0,
      createdAt: new Date(),
      updatedAt: "timestamp",
      lastLogin: "timestamp",
      isLoggedin: false,
      isAdmin: role === "admin" ? true : false,
      isActive: true,
      permissions: {
        lessonAuth: {
          edit: role === "admin" ? true : false,
          Delete: role === "admin" ? true : false,
          Publish: role === "admin" ? true : false,
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
      lessons: [],
      qas: [],
    };

    const usersCollection = await users();
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
    if (user === null) throw "No account found under this email address.";

    const compareToMatch = await bcrypt.compare(password, user.password);

    if (!compareToMatch) throw "Email address and the password do not match.";

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      role: user.role,
    };
  }, //end loginUser

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
    firstName = validation.checkFirstName(firstName, "First Name");
    lastName = validation.checkString(lastName, "Last Name");
    emailAddress = validation.checkEmail(emailAddress);
    password = validation.checkPassword(password);
    role = checkRole(role);
  },
}; //end createUser()

export default exportedusersMethods;
