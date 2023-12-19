import { lessons } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "./validation.js";
import usersData from "./users.js";

function getYouTubeVideoID(url) {
  let videoID = "";
  if (url.includes("youtube.com")) {
    // Extract the "v" parameter from the URL
    const params = new URLSearchParams(new URL(url).search);
    videoID = params.get("v");
  } else if (url.includes("youtu.be")) {
    // Extract the ID from the short URL
    videoID = url.split("youtu.be/")[1];
  } else {
    ("Not a valid youtube video link.");
  }
  return videoID;
}
function generateYouTubeEmbedCode(url) {
  const videoID = getYouTubeVideoID(url);
  if (videoID) {
    return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    return "Invalid YouTube URL";
  }
}

const exportedLessonsMethods = {
  //Creates a lesson + 1 module
  //Option to create additional modules via createModule()
  async createLesson(
    lessonTitle,
    subject,
    description,
    contents,
    moduleTitle,
    text,
    videoLink,
    handle
  ) {
    handle = validation.checkHandle(handle);
    const user = await usersData.getUserByHandle(handle);
    lessonTitle = validation.checkContent(lessonTitle, "lesson title", 3, 250);
    description = validation.checkContent(
      description,
      "lesson description",
      10,
      2500
    );
    //1st module creation is optional
    if (contents) {
      contents.forEach((c) => {
        if (c.moduleTitle)
          moduleTitle = validation.checkContent(
            c.moduleTitle,
            "module title",
            3,
            250
          );
        if (c.text)
          text = validation.checkContent(c.text, "module text", 20, 60000);
        if (c.videoLink) {
          c.videoLink = validation.checkString(c.videoLink, "src/video link");
          c.videoLink = generateYouTubeEmbedCode(c.videoLink);
        }
      });
    }

    const lessonsCollection = await lessons();
    if (!lessonsCollection) throw "Could not get lessons. Try again";

    const dup = await lessonsCollection.findOne({ lessonTitle: lessonTitle });
    if (dup) throw "Lesson already exists with this title.";

    let newLessonInfo = {
      lessonTitle: lessonTitle, //string
      subject: subject,
      description: description, //string
      creatorId: user._id, //from user ID
      handle: handle,
      createdAt: new Date(),
      modifiedAt: new Date(),
      contents: [
        {
          _id: new ObjectId(),
          order: 1,
          moduleTitle: contents[0].moduleTitle, //string
          creatorId: user._id,
          author: handle,
          text: contents[0].text, //string
          videoLink: contents[0].videoLink, // array of string urls to the resource video
          votes: {
            votedUsers: [], // [{ userId: ObjectId, voteTime: "string" }] (timestamp from response header???)
            count: 0, // total count for upVotes
          },
          createdByRole: "",
        },
      ],
    };

    const lessonInfoToInsert = await lessonsCollection.insertOne(newLessonInfo);
    if (!lessonInfoToInsert.acknowledged || !lessonInfoToInsert.insertedId)
      throw "Could not add lesson. Try again.";

    const newLesson = await this.getLessonById(
      lessonInfoToInsert.insertedId.toString()
    );
    return newLesson;
    //console.log(lessonInfoToInsert);
    //return { lessonInserted: true };
  },

  async getLessonById(id) {
    id = validation.checkId(id);
    const lessonsCollection = await lessons();
    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(id) });
    if (!lesson) throw "Error: Lesson not found";
    return lesson;
  },

  async getLessonByTitle(title) {
    title = validation.checkContent(title, "lesson title", 3, 250);
    const lessonsCollection = await lessons();
    const lesson = await lessonsCollection.findOne({ title: title });
    if (!lesson) throw "Error: Lesson not found";
    return lesson;
  },

  async createModule(lessonId, order, moduleTitle, text, videoLink) {
    // function generateYouTubeEmbedCode(url) {
    //   const videoLink = getYouTubeVideoID(url);
    //   if (videoLink) {
    //     return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoLink}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    //   } else {
    //     return "Invalid YouTube URL";
    //   }
    // }
    // // Example usage
    // const videoLink = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Replace with the link from your database
    // const embedCode = generateYouTubeEmbedCode(videoLink);

    const lesson = await this.getLessonById(lessonId);

    lessonId = await validation.checkId(lessonId);
    //order optional
    if (!order) {
      order = lesson.contents.length + 1;
    } else {
      order = validation.checkIsPositiveNum(order, "order");
    }
    validation.checkContent(moduleTitle, "module title", 3, 250);
    validation.checkContent(text, "module content", 20, 60000);

    const lessonsCollection = await lessons();
    if (!lessonsCollection) throw "Could not get lessons. Try again";

    // Prevent duplicate entries
    lesson.contents.forEach((c) => {
      const duplicate = c.moduleTitle == moduleTitle;
      if (duplicate) {
        throw "A module with this name already exists";
      }
    });

    const newModule = {
      _id: new ObjectId(),
      order: order,
      moduleTitle: moduleTitle,
      text: text,
      videoLink: videoLink,
      createdAt: new Date(),
      modifiedAt: new Date(),
      votes: {
        votedUsers: [],
        count: 0,
      },
      createdByRole: "",
    };
    const lessonWithNewModule = await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) },
      { $push: { contents: newModule } }
    );
    if (!lessonWithNewModule.modifiedCount)
      throw "attendee with that email address is already registered";
    //console.log(lessonWithNewModule.modifiedCount);
    //console.log(newModule);

    const result = await this.getLessonById(lessonId);
    return result;
  },

  async getAllLessons() {
    //TODO implement all, byUser, byAdmin per createdByRole using projection
    const lessonsCollection = await lessons();
    const lessonsList = await lessonsCollection
      .find({})
      .sort({ order: 1 })
      .toArray();
    return lessonsList;
  },

  async removeLesson(id) {
    id = validation.checkId(id);
    const lessonsCollection = await lessons();
    const deletionInfo = await lessonsCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletionInfo) throw `Error: Could not delete lesson with id of ${id}`;
    return { ...deletionInfo, deleted: true };
  },

  //Updates lesson headers, not modules
  async updateLesson(id, title, description) {
    id = validation.checkId(id);
    title = validation.checkContent(title, "lesson title", 3, 100);
    description = validation.checkContent(
      description,
      "lesson description",
      3,
      2500
    );

    const lessonUpdateInfo = {
      lessonTitle: lessonTitle,
      subject: subject,
      description: description,
      creatorId: ObjectId, //from user ID
      modifiedAt: new Date(),
    };

    const lessonsCollection = await lessons();
    const updateInfo = await lessonsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: lessonUpdateInfo },
      { returnDocument: "after" }
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a lesson with id of ${id} or overwrite unsuccessful`;

    return updateInfo;
  },

  async updateModule(lessonId, id, order, moduleTitle, text, videoLink) {
    lessonId = validation.checkId(lessonId);

    const lessonsCollection = await lessons();
    const lesson = await this.getLessonById(lessonId);

    if (!order) {
      order = lesson.contents.length + 1;
    } else {
      order = validation.checkIsPositiveNum(order, "order");
    }
    moduleTitle = validation.checkContent(moduleTitle, "lesson title", 3, 250);
    text = validation.checkContent(text, "module content", 3, 2500);
    //contents = validation.checkObjInArr(contents, "lesson contents");

    const moduleUpdateInfo = {
      order: order,
      moduleTitle: moduleTitle,
      text: text,
      //creatorId: ObjectId,
      videoLink: videoLink,
      votes: lesson.votes, //obj,
      modifiedAt: new Date(),
    };

    const updatedModule = await lessonsCollection.findOneAndUpdate(
      { "contents._id": new ObjectId(id) },
      { $set: { "contents.$": moduleUpdateInfo } },
      { returnDocument: "after" }
      //{arrayFilters: []}
    );
    if (!updatedModule)
      throw `Error: Update failed, could not find a lesson with id of ${id} or overwrite unsuccessful`;

    return updatedModule;
  },
};

export default exportedLessonsMethods;
