import { MongoExpiredSessionError } from 'mongodb';
import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { users, lessons, qa } from '../config/mongoCollections.js';
import userData from '../data/users.js';
import qaData from '../data/qa.js';
import lessonsData from '../data/lessons.js';
const db = await dbConnection();
await db.dropDatabase();
let newUser = undefined;
let newLesson = undefined;
let newQaPost = undefined;
let newQaResponse = undefined;

// Example user registration calls with random data and strong passwords
try {
  await userData.registerUser(
    'Alice',
    'Johnson',
    'alice.j@example.com',
    'Password123!',
    'user'
  );
  await userData.registerUser(
    'Bob',
    'Smith',
    'bob.smith@example.com',
    'Secure789!',
    'user'
  );
  await userData.registerUser(
    'Charlie',
    'Brown',
    'charlie.b@example.com',
    'StrongPass1!',
    'user'
  );
  await userData.registerUser(
    'David',
    'Miller',
    'david.m@example.com',
    'SafePassword42#',
    'user'
  );
  await userData.registerUser(
    'Emma',
    'Taylor',
    'emma.t@example.com',
    'Secret123@',
    'user'
  );
  await userData.registerUser(
    'Frank',
    'Wilson',
    'frank.w@example.com',
    'Hidden567$',
    'user'
  );
  await userData.registerUser(
    'Grace',
    'Anderson',
    'grace.a@example.com',
    'Protected1@',
    'user'
  );
  await userData.registerUser(
    'Henry',
    'Clark',
    'henry.c@example.com',
    'Guarded987#',
    'user'
  );
  await userData.registerUser(
    'Ivy',
    'Robinson',
    'ivy.r@example.com',
    'Locked654!',
    'user'
  );
  await userData.registerUser(
    'Jack',
    'Moore',
    'jack.m@example.com',
    'Shielded123$',
    'admin'
  );
  await userData.registerUser(
    'Karen',
    'Lee',
    'karen.lee@example.com',
    'SecretPass12!',
    'admin'
  );
  await userData.registerUser(
    'Liam',
    'Garcia',
    'liam.g@example.com',
    'SecureCode123!',
    'user'
  );
  await userData.registerUser(
    'Mia',
    'Wright',
    'mia.w@example.com',
    'HiddenKey789!',
    'user'
  );
  await userData.registerUser(
    'Noah',
    'Fisher',
    'noah.f@example.com',
    'Guardian789!',
    'user'
  );
  await userData.registerUser(
    'Olivia',
    'Baker',
    'olivia.b@example.com',
    'SafeLock1@',
    'user'
  );
  await userData.registerUser(
    'Peter',
    'King',
    'peter.k@example.com',
    'Defender456!',
    'user'
  );
  await userData.registerUser(
    'Quinn',
    'Evans',
    'quinn.e@example.com',
    'SecureWord1!',
    'user'
  );
  await userData.registerUser(
    'Rachel',
    'Young',
    'rachel.y@example.com',
    'ProtectedABC!',
    'user'
  );
  await userData.registerUser(
    'Sam',
    'Hill',
    'sam.h@example.com',
    'GuardedXYZ1@',
    'admin'
  );
  await userData.registerUser(
    'Tom',
    'Fisher',
    'tom.f@example.com',
    'SecurePass123@',
    'user'
  );
  await userData.registerUser(
    'Mario',
    'Plumber',
    'mario.plumber@example.com',
    'Luigi123!',
    'user'
  );
  await userData.registerUser(
    'Luigi',
    'Green',
    'luigi.green@example.com',
    'Mario456!',
    'user'
  );
  await userData.registerUser(
    'Princess',
    'Peach',
    'princess.peach@example.com',
    'Toadstool789!',
    'user'
  );
  await userData.registerUser(
    'Bowser',
    'King',
    'bowser.king@example.com',
    'Koopa1234!',
    'user'
  );
  await userData.registerUser(
    'Yoshi',
    'Dino',
    'yoshi.dino@example.com',
    'EggEater567!',
    'user'
  );
  await userData.registerUser(
    'Wario',
    'Greedy',
    'wario.greedy@example.com',
    'GoldCoins789!',
    'user'
  );
  await userData.registerUser(
    'Toad',
    'Mushroom',
    'toad.mushroom@example.com',
    'SporeGuard1@',
    'user'
  );
  await userData.registerUser(
    'Koopa',
    'Troopa',
    'koopa.troopa@example.com',
    'ShellShield456!',
    'user'
  );
  await userData.registerUser(
    'Donkey',
    'Kong',
    'donkey.kong@example.com',
    'BananaGuard1@',
    'admin'
  );
  await userData.registerUser(
    'Princess',
    'Daisy',
    'princess.daisy@example.com',
    'FlowerPower123@',
    'user'
  );
} catch (e) {
  throw new Error('Seeding failed');
}

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
