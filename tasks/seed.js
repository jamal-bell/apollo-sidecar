import { MongoExpiredSessionError } from 'mongodb';
import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { users, lessons, qa } from '../config/mongoCollections.js';
import userData from '../data/users.js';
import { ObjectId } from 'mongodb';
import qaData from '../data/qa.js';
import lessonsData from '../data/lessons.js';
const db = await dbConnection();
await db.dropDatabase();
let newUser = undefined;
let newLesson = undefined;
let newQaPost = undefined;
let newQaResponse = undefined;

try {
  await Promise.all([
    userData.registerUser(
      'Alice',
      'Johnson',
      'alice.j@example.com',
      'Password123!',
      'user'
    ),
    userData.registerUser(
      'Bob',
      'Smith',
      'bob.smith@example.com',
      'Secure789!',
      'user'
    ),
    userData.registerUser(
      'Charlie',
      'Brown',
      'charlie.b@example.com',
      'StrongPass1!',
      'user'
    ),
    userData.registerUser(
      'David',
      'Miller',
      'david.m@example.com',
      'SafePassword42#',
      'user'
    ),
    userData.registerUser(
      'Sam',
      'Hill',
      'sam.h@example.com',
      'GuardedXYZ1@',
      'admin'
    ),
    userData.registerUser(
      'Tom',
      'Fisher',
      'tom.f@example.com',
      'SecurePass123@',
      'user'
    ),
    userData.registerUser(
      'Mario',
      'Plumber',
      'mario.plumber@example.com',
      'Luigi123!',
      'user'
    ),
    userData.registerUser(
      'Luigi',
      'Green',
      'luigi.green@example.com',
      'Mario456!',
      'user'
    ),
    userData.registerUser(
      'Princess',
      'Peach',
      'princess.peach@example.com',
      'Toadstool789!',
      'user'
    ),
    userData.registerUser(
      'Bowser',
      'King',
      'bowser.king@example.com',
      'Koopa1234!',
      'user'
    ),
    userData.registerUser(
      'Yoshi',
      'Dino',
      'yoshi.dino@example.com',
      'EggEater567!',
      'user'
    ),
    userData.registerUser(
      'Wario',
      'Greedy',
      'wario.greedy@example.com',
      'GoldCoins789!',
      'user'
    ),
    userData.registerUser(
      'Toad',
      'Mushroom',
      'toad.mushroom@example.com',
      'SporeGuard1@',
      'user'
    ),
    userData.registerUser(
      'Koopa',
      'Troopa',
      'koopa.troopa@example.com',
      'ShellShield456!',
      'user'
    ),
    userData.registerUser(
      'Donkey',
      'Kong',
      'donkey.kong@example.com',
      'BananaGuard1@',
      'admin'
    ),
    userData.registerUser(
      'Princess',
      'Daisy',
      'princess.daisy@example.com',
      'FlowerPower123@',
      'user'
    ),
  ]);
} catch (e) {
  throw new Error(`Seeding failed at users: ${e.message}`);
}
console.log('Seeding users completed!');
let userIds;
try {
  const userCollection = await users();
  userIds = await userCollection
    .find()
    .map((user) => user._id)
    .toArray();
} catch (e) {
  throw new Error(`Flattening CreatorIds failed: ${e.message}`);
}
console.log('Flattening IDs for random lesson creation completed!');
try {
  const lessonsCollection = await lessons();
  const lessonTitlePrefix = 'Lesson';
  await Promise.all(
    Array.from({ length: 30 }, (_, index) => {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const authorChosen = userCollection.findOne({ _id: randomUserId });
      const newLessonInfo = {
        lessonTitle: `${lessonTitlePrefix} ${index + 1}`,
        description: `Description for Lesson ${index + 1}`,
        creatorId: authorChosen._id,
        contents: [
          {
            _id: new ObjectId(),
            order: 1,
            moduleTitle: `Module for Lesson ${index + 1}`,
            creatorId: authorChosen._id,
            author: authorChosen.handle,
            text: `Text for Lesson ${index + 1}`,
            videoLink: ['https://example.com/video'],
            createdByRole: authorChosen.role,
          },
        ],
      };
      return lessonsCollection.insertOne(newLessonInfo);
    })
  );
  console.log('Seeding Lessons Completed!');
  console.log('Seeding completed successfully!');
} catch (e) {
  console.error('Seeding failed at lessons:', e);
} finally {
  await closeConnection();
}
