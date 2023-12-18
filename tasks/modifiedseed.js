import { MongoExpiredSessionError } from "mongodb";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { users, lessons, qa } from "../config/mongoCollections.js";
import userData from "../data/users.js";
import { ObjectId } from "mongodb";
import qaData from "../data/qa.js";
import lessonsData from "../data/lessons.js";

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
  throw new Error("Error ");
}

// ------------------------------> enter the number of lessons and users you want  <-------------------------

// const numUsers = 5; / broken.
const numLessons = 20;
const numberOfQaEntries = 75; // Adjust as needed
//============================================================================================================

const firstNameList = [
  "Alice",
  "Johnson",
  "Bob",
  "Charlie",
  "David",
  "Sam",
  "Tom",
  "Mario",
  "Luigi",
  "Princess",
  "Bowser",
  "King",
  "Yoshi",
  "Dino",
  "Wario",
  "Greedy",
  "Toad",
  "Mushroom",
  "Koopa",
  "Troopa",
  "Kong",
];
const lastNameList = [
  "Alice",
  "Johnson",
  "Bob",
  "Charlie",
  "David",
  "Sam",
  "Tom",
  "Mario",
  "Luigi",
  "Princess",
  "Bowser",
  "King",
  "Yoshi",
  "Dino",
  "Wario",
  "Greedy",
  "Toad",
  "Mushroom",
  "Koopa",
  "Troopa",
  "Kong",
];
const userRoleList = ["user", "admin"];
const LessonTitlePrefixList = [
  "Get Started With",
  "Intro to",
  "Advanced",
  "Web Develepment Using",
  "Beginner",
];
const subjects = [
  "JavaScript",
  "NodeJS",
  "React",
  "HTML",
  "Express & Express Handlebars",
  "MongoDB",
  "TypeScript",
  "REST API",
];
const qaTitleList = [
  "What is the best way to learn",
  "Can I import modules in",
  "Can I make an an API in",
  "What's needed to make an app in",
  "Can someone help with errors in",
];

let firstName;
let lastName;
let emailAddress;
let passWord;
let userRole;
let handle;

try {
  await Promise.all([
    await userData.registerUser(
      "Mario",
      "Plumber",
      "mario.plumber@example.com",
      "mario",
      "Luigi123!",
      "admin"
    ),
    await userData.registerUser(
      "Luigi",
      "Green",
      "luigi.green@example.com",
      "luigi",
      "Mario456!",
      "user"
    ),
    await userData.registerUser(
      "Princess",
      "Peach",
      "princess.peach@example.com",
      "peach",
      "Toadstool789!",
      "admin"
    ),
    await userData.registerUser(
      "Bowser",
      "King",
      "bowser.king@example.com",
      "bowser",
      "Koopa1234!",
      "admin"
    ),
    await userData.registerUser(
      "Yoshi",
      "Dino",
      "yoshi.dino@example.com",
      "yoshi",
      "EggEater567!",
      "user"
    ),
    await userData.registerUser(
      "Wario",
      "Greedy",
      "wario.greedy@example.com",
      "wario",
      "GoldCoins789!",
      "user"
    ),
    await userData.registerUser(
      "Toad",
      "Mushroom",
      "toad.mushroom@example.com",
      "toad",
      "SporeGuard1@",
      "user"
    ),
    await userData.registerUser(
      "Koopa",
      "Troopa",
      "koopa.troopa@example.com",
      "koopa",
      "ShellShield456!",
      "user"
    ),
    await userData.registerUser(
      "Donkey",
      "Kong",
      "donkey.kong@example.com",
      "donkey",
      "BananaGuard1@",
      "admin"
    ),
    await userData.registerUser(
      "Princess",
      "Daisy",
      "princess.daisy@example.com",
      "daisy",
      "FlowerPower123@",
      "admin"
    ),
    await userData.registerUser(
      "Bowser",
      "Jr",
      "bowser.jr@example.com",
      "bowserjr",
      "Junior789!",
      "user"
    ),
    await userData.registerUser(
      "Toadette",
      "Mushroom",
      "toadette.mushroom@example.com",
      "toadette",
      "PinkShroom456!",
      "user"
    ),
    await userData.registerUser(
      "Waluigi",
      "Purple",
      "waluigi.purple@example.com",
      "waluigi",
      "Purple123!",
      "user"
    ),
    await userData.registerUser(
      "Rosalina",
      "Galaxy",
      "rosalina.galaxy@example.com",
      "rosalina",
      "Galaxy456!",
      "admin"
    ),
    await userData.registerUser(
      "Kamek",
      "Magikoopa",
      "kamek.magikoopa@example.com",
      "kamek",
      "Magic789!",
      "user"
    ),
    await userData.registerUser(
      "Boo",
      "Ghost",
      "boo.ghost@example.com",
      "boo",
      "Ghostly123@",
      "user"
    ),
    await userData.registerUser(
      "Dry",
      "Bones",
      "dry.bones@example.com",
      "drybones",
      "BoneBone123!",
      "user"
    ),
    await userData.registerUser(
      "Shy",
      "Guy",
      "shy.guy@example.com",
      "shyguy",
      "ShyGuy123!",
      "user"
    ),
  ]);

  console.log("Seeding Lessons Completed!");
} catch (e) {
  throw new Error(`Seeding failed at users: ${e.message}`);
}
console.log("Seeding users completed!");
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
console.log("Flattening IDs for random lesson creation completed!");
try {
  lessonsCollection = await lessons();
  const lessonTitlePrefix = "Lesson";
  userCollection = await users();

  const start = new Date(1999, 1, 1); // Minimum start date
  const now = new Date(); // Current date
  const end = new Date(2024, 11, 31); // Maximum end date (specificFutureDate)

  // Calculate range for randomStart (1999 - now)
  const startRangeMilliseconds = now.getTime() - start.getTime();

  // Generate random start date within the range
  const randomStartOffset = Math.floor(Math.random() * startRangeMilliseconds);
  const randomStart = new Date(start.getTime() + randomStartOffset);

  // Calculate range for modifiedDate (randomStart - end)
  const modifiedRangeMilliseconds = randomStart.getTime() - end.getTime();

  // Generate random modified date within the range
  const randomModifiedOffset = Math.floor(
    Math.random() * modifiedRangeMilliseconds
  );
  const modifiedDate = new Date(randomStart.getTime() - randomModifiedOffset);

  for (let index = 0; index < numLessons; index++) {
    const lessonTitlePrefix =
      LessonTitlePrefixList[
        Math.floor(Math.random() * LessonTitlePrefixList.length)
      ];
    const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const authorChosen = await userCollection.findOne({ _id: randomUserId });

    const newLessonInfo = {
      lessonTitle: `${lessonTitlePrefix} ${randomSubject} ${index + 1}`,
      subject: randomSubject,
      description: `${randomSubject} Lorem Ipsum adalah contoh teks atau dummy dalam industri percetakan dan penataan huruf atau typesetting. Lorem Ipsum telah menjadi standar contoh teks sejak tahun 1500an, saat seorang tukang cetak yang tidak dikenal mengambil sebuah kumpulan teks dan mengacaknya untuk menjadi sebuah buku contoh huruf. Ia tidak hanya bertahan selama 5 abad, tapi juga telah beralih ke penataan huruf elektronik, tanpa ada perubahan apapun. Ia mulai dipopulerkan pada tahun 1960 dengan diluncurkannya lembaran-lembaran Letraset yang menggunakan kalimat-kalimat dari Lorem Ipsum, dan seiring munculnya perangkat lunak Desktop Publishing seperti Aldus PageMaker juga memiliki versi Lorem Ipsum.`,
      creatorId: authorChosen._id,
      handle: "gerneric",
      createdAt: "I need random date between 1999 until now",
      modifiedAt: "need a randome date between createdAt and now ",
      contents: [
        {
          _id: new ObjectId(),
          order: 1,
          moduleTitle: `Module for Lesson ${index + 1}`,
          creatorId: authorChosen._id,
          author: authorChosen.handle,
          text: `Text for Lesson ${index + 1}`,
          videoLink: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          createdByRole: authorChosen.role,
          createdAt:
            "I need this date to equal the newLessonInfo createdAt above",
          modifiedAt:
            "I need this date to be a random date beween createdAt and now",
        },
      ],
    };

    const result = await lessonsCollection.insertOne(newLessonInfo);

    // console.log(result); // Log the inserted document
    // const result2 = await userCollection.updateOne(
    //   { _id: authorChosen._id },
    //   { $push: { "progress.createdLessonId": { lessonId: result.insertedId } } }
    // );

    await userData.addLesson(
      authorChosen._id.toString(),
      result.insertedId.toString(),
      "created"
    );
    // console.log(result2);
  }
  console.log("Seeding Lessons Completed!");
} catch (e) {
  console.error("Seeding failed at lessons:", e);
}

// prep QA seeding ===========================================================
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
  console.error("Seeding failed at flattening constantIds:", e);
}

// seeding QAs

try {
  for (let i = 0; i < numberOfQaEntries; i++) {
    // Randomly select a lesson object from allLessonIdsForQaSeeding
    const randomLessonObject =
      allLessonIdsForQaSeeding[
        Math.floor(Math.random() * allLessonIdsForQaSeeding.length)
      ];
    const qaTitlePrefix =
      qaTitleList[Math.floor(Math.random() * qaTitleList.length)];
    const randomSubjects = randomLessonObject.subject;

    // Extract properties from the selected lesson object
    const { lessonId, contentId, creatorId } = randomLessonObject;
    const lessonIdString = lessonId.toString();
    const contentIdString = contentId.toString();
    const creatorIdString = creatorId.toString();

    // Generate random title and text (you can replace these with your own logic)
    const title = `${qaTitlePrefix} ${randomSubjects}?`;
    const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget feugiat mi. Nullam 
      aliquet erat in lorem tempus fermentum. Mauris sagittis dolor consectetur ante tristique 
      dapibus. Aenean consequat sem est.`;

    // Call the createQa function with the extracted properties
    await qaData.createQa(
      title,
      creatorIdString,
      lessonIdString,
      contentIdString,
      text
    );
  }
  console.log("Seeding QA Completed!");
} catch (e) {
  console.error("Seeding failed at creating QAs:", e);
}

await closeConnection();
