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
let userCollection;
let lessonsCollection;
try {
  userCollection = await users();
} catch (e) {
  throw new Error('Error ');
}
try {
  await Promise.all([
    await userData.registerUser(
      'Mario',
      'Plumber',
      'mario.plumber@example.com',
      'mario',
      'Luigi123!',
      'admin'
    ),
    await userData.registerUser(
      'Luigi',
      'Green',
      'luigi.green@example.com',
      'luigi',
      'Mario456!',
      'user'
    ),
    await userData.registerUser(
      'Princess',
      'Peach',
      'princess.peach@example.com',
      'peach',
      'Toadstool789!',
      'admin'
    ),
    await userData.registerUser(
      'Bowser',
      'King',
      'bowser.king@example.com',
      'bowser',
      'Koopa1234!',
      'admin'
    ),
    await userData.registerUser(
      'Yoshi',
      'Dino',
      'yoshi.dino@example.com',
      'yoshi',
      'EggEater567!',
      'user'
    ),
    await userData.registerUser(
      'Wario',
      'Greedy',
      'wario.greedy@example.com',
      'wario',
      'GoldCoins789!',
      'user'
    ),
    await userData.registerUser(
      'Toad',
      'Mushroom',
      'toad.mushroom@example.com',
      'toad',
      'SporeGuard1@',
      'user'
    ),
    await userData.registerUser(
      'Koopa',
      'Troopa',
      'koopa.troopa@example.com',
      'koopa',
      'ShellShield456!',
      'user'
    ),
    await userData.registerUser(
      'Donkey',
      'Kong',
      'donkey.kong@example.com',
      'donkey',
      'BananaGuard1@',
      'admin'
    ),
    await userData.registerUser(
      'Princess',
      'Daisy',
      'princess.daisy@example.com',
      'daisy',
      'FlowerPower123@',
      'admin'
    ),
    await userData.registerUser(
      'Bowser',
      'Jr',
      'bowser.jr@example.com',
      'bowserjr',
      'Junior789!',
      'user'
    ),
    await userData.registerUser(
      'Toadette',
      'Mushroom',
      'toadette.mushroom@example.com',
      'toadette',
      'PinkShroom456!',
      'user'
    ),
    await userData.registerUser(
      'Waluigi',
      'Purple',
      'waluigi.purple@example.com',
      'waluigi',
      'Purple123!',
      'user'
    ),
    await userData.registerUser(
      'Rosalina',
      'Galaxy',
      'rosalina.galaxy@example.com',
      'rosalina',
      'Galaxy456!',
      'admin'
    ),
    await userData.registerUser(
      'Kamek',
      'Magikoopa',
      'kamek.magikoopa@example.com',
      'kamek',
      'Magic789!',
      'user'
    ),
    await userData.registerUser(
      'Boo',
      'Ghost',
      'boo.ghost@example.com',
      'boo',
      'Ghostly123@',
      'user'
    ),
    await userData.registerUser(
      'Dry',
      'Bones',
      'dry.bones@example.com',
      'drybones',
      'BoneBone123!',
      'user'
    ),
    await userData.registerUser(
      'Shy',
      'Guy',
      'shy.guy@example.com',
      'shyguy',
      'ShyGuy123!',
      'user'
    ),
  ]);
} catch (e) {
  throw new Error(`Seeding failed at users: ${e.message}`);
}
console.log('Seeding users completed!');
let userIds;
try {
  userCollection = await users();
  userIds = await userCollection
    .find()
    .map((user) => user._id)
    .toArray();
} catch (e) {
  throw new Error(`Flattening CreatorIds failed: ${e.message}`);
}
console.log('Flattening IDs for random lesson creation completed!');
try {
  lessonsCollection = await lessons();
  const lessonTitlePrefix = 'Lesson';
  userCollection = await users();
  for (let index = 0; index < 30; index++) {
    const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
    const authorChosen = await userCollection.findOne({ _id: randomUserId });
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
          videoLink: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
          createdByRole: authorChosen.role,
        },
      ],
    };
    const result = await lessonsCollection.insertOne(newLessonInfo);
    console.log(result); // Log the inserted document
    const result2 = await userCollection.updateOne(
      { _id: authorChosen._id },
      { $push: { 'progress.createdLessonId': result.insertedId } }
    );
    console.log(result2);
  }
  console.log('Seeding Lessons Completed!');
} catch (e) {
  console.error('Seeding failed at lessons:', e);
}
let allLessonIdsForQaSeeding;
try {
  allLessonIdsForQaSeeding = await lessonsCollection
    .find()
    .map((lesson) =>
      lesson.contents.map((content) => ({
        lessonId: lesson._id,
        contentId: content._id,
        creatorId: content.creatorId,
      }))
    )
    .toArray();

  allLessonIdsForQaSeeding = allLessonIdsForQaSeeding.flat();
} catch (e) {
  console.error('Seeding failed at flattening constantIds:', e);
}
console.log('Flattening IDs for random qa creation completed!');

try {
  const numberOfQaEntries = 1; // Adjust as needed

  for (let i = 0; i < numberOfQaEntries; i++) {
    // Randomly select a lesson object from allLessonIdsForQaSeeding
    const randomLessonObject =
      allLessonIdsForQaSeeding[
        Math.floor(Math.random() * allLessonIdsForQaSeeding.length)
      ];

    // Extract properties from the selected lesson object
    const { lessonId, contentId, creatorId } = randomLessonObject;
    const lessonIdString = lessonId.toString();
    const contentIdString = contentId.toString();
    const creatorIdString = creatorId.toString();
    // Generate random title and text (you can replace these with your own logic)
    const title = `Q&A Entry ${i + 1} Title`;
    const text = `Q&A Entry ${
      i + 1
    } Text. It must be over 24 characters long or else the journey ends here. I like banana sprinkles and such.`;

    // Call the createQa function with the extracted properties
    await qaData.createQa(
      title,
      creatorIdString,
      lessonIdString,
      contentIdString,
      text
    );
  }
} catch (e) {
  console.error('Seeding failed at creating QAs:', e);
}
await closeConnection();
