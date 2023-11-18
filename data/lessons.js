import {lessons} from "../config/mongoCollections.js";
import {ObjectId} from "mongodb";
import validation from validation.js;

let exportedLessonMethods = {
  async createLesson(title, description, contents) {
    title = validation.checkString(title, 'lesson title');
    description = validation.checkString(description, 'lesson description');
    contents = validation.checkString(contents, 'lesson contents');

    const newLessonInfo = 
    [
      {
        title: title, //string
        description: description, //string
        creatorId: ObjectId, //from user ID
        contents: [
          {
            contentId: ObjectId, // or it could be ordered numbers
            title: title, //string
            creatorId: ObjectId,
            text: text,//string
            videoLink: videoLink, // string - link to the lesson video
            votes: {
              votedUsers: [], // [{ userId: ObjectId, voteTime: "string" }] (timestamp from response header???)
              count: 0, // total count for upVotes
            },
          },
        ],
      },
    ]

    const lessonCollection = await lessons();
    const lessonInfoToInsert = await lessonCollection.insertOne(newLessonInfo);
    if (!lessonInfoToInsert.acknowledged || !lessonInfoToInsert.insertedId) throw "Could not add lesson. Try again."
    //return new lesson
    const newLesson = await get(lessonInfoToInsert.insertedId.toString())
  },
  async getAllLessons() {
    const lessonsCollection = await lessons();
    const lessonsList = await lessonsCollection.find({}).toArray();
    return lessonsList;
  },
  async getLessonById(id) {
    id = validation.checkId(id);
    const lessonCollection = await lessons();
    const lesson = await lessonCollection.findOne({_id: new ObjectId(id)});
    if (!lesson) throw 'Error: Lesson not found';
    return lesson;
  },
  async removeLesson(id) {
    id = validation.checkId(id);
    const lessonCollection = await lessons();
    const deletionInfo = await lessonsCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });
    if (!deletionInfo) throw `Error: Could not delete lesson with id of ${id}`;

    return {...deletionInfo, deleted: true};
  },
  async updateLessonPut(id, title, description, contents) {
    id = validation.checkId(id);
    title = validation.checkString(title, 'lesson title');
    description = validation.checkString(description, 'lesson description');
    contents = validation.checkString(contents, 'lesson contents');

    const lessonUpdateInfo = {
      title: title,
      description: description,
      contents: contents,
    };
    const lessonsCollection = await lessons();
    const updateInfo = await lessonsCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      lessonUpdateInfo,
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a lesson with id of ${id}`;

    return updateInfo;
  },
}

export default exportedLessonMethods;