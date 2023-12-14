import { MongoExpiredSessionError } from 'mongodb';
import { dbConnection, closeConnection } from '../config/mongoConnection.js';

const db = await dbConnection();
await db.dropDatabase();
import { users } from '../config/mongoCollections.js';

//-----------------Create Users---------------------//
const userCollection = await users();
const userSeedData = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    emailAddress: 'alice.j@example.com',
    role: 'admin',
    password: 'apple1A!',
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    emailAddress: 'bob.smith@example.com',
    role: 'user',
    password: 'banana2B!',
  },
  {
    firstName: 'Charlie',
    lastName: 'Brown',
    emailAddress: 'charlie.b@example.com',
    role: 'admin',
    password: 'cherry3C!',
  },
  {
    firstName: 'David',
    lastName: 'Miller',
    emailAddress: 'david.m@example.com',
    role: 'user',
    password: 'date4D!',
  },
  {
    firstName: 'Emma',
    lastName: 'Taylor',
    emailAddress: 'emma.t@example.com',
    role: 'admin',
    password: 'elephant5E!',
  },
  {
    firstName: 'Frank',
    lastName: 'Wilson',
    emailAddress: 'frank.w@example.com',
    role: 'user',
    password: 'frog6F!',
  },
  {
    firstName: 'Grace',
    lastName: 'Anderson',
    emailAddress: 'grace.a@example.com',
    role: 'admin',
    password: 'grape7G!',
  },
  {
    firstName: 'Henry',
    lastName: 'Clark',
    emailAddress: 'henry.c@example.com',
    role: 'user',
    password: 'horse8H!',
  },
  {
    firstName: 'Ivy',
    lastName: 'Robinson',
    emailAddress: 'ivy.r@example.com',
    role: 'admin',
    password: 'icecream9I!',
  },
  {
    firstName: 'Jack',
    lastName: 'Moore',
    emailAddress: 'jack.m@example.com',
    role: 'user',
    password: 'jacket10J!',
  },
  {
    firstName: 'Kelly',
    lastName: 'Carter',
    emailAddress: 'kelly.c@example.com',
    role: 'admin',
    password: 'kiwi11K!',
  },
  {
    firstName: 'Leo',
    lastName: 'Davis',
    emailAddress: 'leo.d@example.com',
    role: 'user',
    password: 'lemon12L!',
  },
  {
    firstName: 'Mia',
    lastName: 'Johnson',
    emailAddress: 'mia.j@example.com',
    role: 'admin',
    password: 'melon13M!',
  },
  {
    firstName: 'Nathan',
    lastName: 'White',
    emailAddress: 'nathan.w@example.com',
    role: 'user',
    password: 'nut14N!',
  },
  {
    firstName: 'Olivia',
    lastName: 'Hall',
    emailAddress: 'olivia.h@example.com',
    role: 'admin',
    password: 'orange15O!',
  },
  {
    firstName: 'Paul',
    lastName: 'Baker',
    emailAddress: 'paul.b@example.com',
    role: 'user',
    password: 'peach16P!',
  },
  {
    firstName: 'Quinn',
    lastName: 'Fisher',
    emailAddress: 'quinn.f@example.com',
    role: 'admin',
    password: 'quokka17Q!',
  },
  {
    firstName: 'Rachel',
    lastName: 'Young',
    emailAddress: 'rachel.y@example.com',
    role: 'user',
    password: 'rabbit18R!',
  },
  {
    firstName: 'Sam',
    lastName: 'Evans',
    emailAddress: 'sam.e@example.com',
    role: 'admin',
    password: 'strawberry19S!',
  },
  {
    firstName: 'Tom',
    lastName: 'Hill',
    emailAddress: 'tom.h@example.com',
    role: 'user',
    password: 'tiger20T!',
  },
];

await userCollection.insertMany(userSeedData);

await closeConnection();
