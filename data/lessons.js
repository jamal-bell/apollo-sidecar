import { lessons } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "./validation.js";

let exportedLessonsMethods = {
  async createLesson(title, description, contents, moduleTitle, text, videoLink) {
    title = validation.checkContent(title, "lesson title", 3, 250);
    description = validation.checkContent(
      description,
      "lesson description",
      10,
      2500
    );
    //module creation is optional
    if (contents) {
      contents.forEach((c) => {
        if (c.moduleTitle)
          moduleTitle = validation.checkContent(
            c.moduleTitle,
            "module title", 3, 250
          );
        if (c.text) text = validation.checkContent(c.text, "module text", 10, 60000);
        if (c.videoLink)
          videoLink = validation.checkString(
            c.videoLink,
            "src/video link"
          );
      });
    }

    let newLessonInfo = {
      title: title, //string
      description: description, //string
      creatorId: ObjectId, //from user ID
      contents: [
        {
          //contentId: new ObjectId(), //mongodb object
          _id: contents.length,
          moduleTitle: contents[0].moduleTitle, //string
          creatorId: new ObjectId(),
          text: contents[0].text, //string
          videoLink: contents[0].videoLink, // array of string urls to the resource video
          votes: {
            votedUsers: [], // [{ userId: ObjectId, voteTime: "string" }] (timestamp from response header???)
            count: 0, // total count for upVotes
          },
        },
      ],
    };

    const lessonsCollection = await lessons();
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

  async createLessonModule(id, moduleTitle, text, videoLink) {
    //TODO: more input validation
    if (id === undefined) throw "No id provided";
    id = validation.checkId(id);
    validation.checkString(moduleTitle, "module title");
    validation.checkContent(text, "module content", 20, 1500);

    const lessonsCollection = await lessons();
    if (!lessonsCollection) throw "Could not get lessons. Try again";

    // Prevent duplicate entries
    const lesson = await this.getLessonById(id);
    lesson.contents.forEach((c) => {
      const duplicate = c.moduleTitle == moduleTitle;
      if (duplicate) {
        throw "A module with this name already exists";
      }
    });

    const newModule = {
      _id: lesson.contents.length + 1,
      moduleTitle: moduleTitle,
      text: text,
      videoLink: videoLink,
    };
    const updatedModule = await lessonsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { contents: newModule } }
    );
    if (!updatedModule.modifiedCount)
      throw "attendee with that email address is already registered";
    console.log(updatedModule.modifiedCount);
    console.log(newModule);

    const result = await this.getLessonById(id);
    return result;
  },

  async getAllLessons() {
    const lessonsCollection = await lessons();
    const lessonsList = await lessonsCollection.find({}).toArray();
    return lessonsList;
  },

  async removeLesson(id) {
    id = validation.checkId(id);
    const lessonsCollection = await lessons();
    const deletionInfo = await lessonsCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletionInfo) throw `Error: Could not delete lesson with id of ${id}`;
    console.log("Lesson Removed");
    return { ...deletionInfo, deleted: true };
  },
  //TOFIX split out update lesson and update module since this overwrites contents.length > 1
  async updateLessonPut(id, title, description, contents, moduleTitle, text, videoLink) {
    id = validation.checkId(id);
    title = validation.checkContent(title, "lesson title", 3, 100);
    description = validation.checkContent(
      description,
      "lesson description",
      3,
      2500
    );
    // contents = validation.checkObjInArr(contents, "lesson contents");

    contents.forEach((c) => {
      if (c.moduleTitle)
        moduleTitle = validation.checkContent(
          c.moduleTitle,
          "module title", 3, 250
        );
      if (c.text) text = validation.checkContent(c.text, "module text", 10, 60000);
      if (c.videoLink)
        videoLink = validation.checkString(
          c.videoLink,
          "src/video link"
        );
    });

    const lessonUpdateInfo = {
      title: title,
      description: description,
      contents: contents,
      creatorId: ObjectId, //from user ID
      contents: [
        {
          _id: contents.length,
          moduleTitle: contents[0].moduleTitle, //string
          creatorId: new ObjectId(),
          text: contents[0].text, //string
          videoLink: contents[0].videoLink, // array of string urls to the resource video
          votes: {
            votedUsers: [], // [{ userId: ObjectId, voteTime: "string" }] (timestamp from response header???)
            count: 0, // total count for upVotes
          },
        },
      ],
    };
    const lessonsCollection = await lessons();
    const updateInfo = await lessonsCollection.findOneAndReplace(
      { _id: new ObjectId(id) },
      lessonUpdateInfo,
      { returnDocument: "after" }
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a lesson with id of ${id} or overwrite unsuccessful`;

    return updateInfo;
  },
};

export default exportedLessonsMethods;
