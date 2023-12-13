import { lessons } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "./validation.js";

let exportedLessonsMethods = {
  //Creates a lesson + 1 module
  //Option to create additional modules via createModule()
  async createLesson(
    lessonTitle,
    description,
    contents = null,
    moduleTitle,
    text,
    videoLink
  ) {
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
        if (c.videoLink)
          videoLink = validation.checkString(c.videoLink, "src/video link");
      });
    }

    let newLessonInfo = {
      lessonTitle: lessonTitle, //string
      description: description, //string
      creatorId: ObjectId, //from user ID
      contents: [
        {
          _id: new ObjectId(),
          order: 1,
          moduleTitle: contents[0].moduleTitle, //string
          creatorId: new ObjectId(),
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

  async getLessonByTitle(title) {
    title = validation.checkContent(title, "lesson title", 3, 250);
    const lessonsCollection = await lessons();
    const lesson = await lessonsCollection.findOne({ title: title });
    if (!lesson) throw "Error: Lesson not found";
    return lesson;
  },

  async createModule(id, order, moduleTitle, text, videoLink) {
    //TODO: finish input validation
    const lesson = await this.getLessonById(id);

    id = await validation.checkId(id);
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
      votes: {
        votedUsers: [],
        count: 0,
      },
      createdByRole: "",
    };
    const lessonWithNewModule = await lessonsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { contents: newModule } }
    );
    if (!lessonWithNewModule.modifiedCount)
      throw "attendee with that email address is already registered";
    console.log(lessonWithNewModule.modifiedCount);
    console.log(newModule);

    const result = await this.getLessonById(id);
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
    console.log("Lesson Removed");
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
      description: description,
      creatorId: ObjectId, //from user ID
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
      votes: lesson.votes, //obj
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