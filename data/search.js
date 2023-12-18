
import lessonsData from "./lessons.js"
import qaData from "./lessons.js"

const exportedusersMethods = {
    checkSearchInput(strVal, varName) {
        if (!strVal || strVal === "") throw `Seach input is required`
        if (typeof strVal !== "string") throw `Error: The ${varName} field only accepts strings`;
        strVal= strVal.trim();
        if (!isNaN(strVal)) throw `Error: Your ${varName} input is not a valid as it only contains digits`;
        
        // const regex = /[!@#$%^&*(),.?":{}|<>]/;
        // const hasSpecialChar = regex.test(strVal);
        // if(hasSpecialChar) throw `[!@#$%^*(),.":{}|<>] `
        return strVal
    },

    async performSearch(keywords) {
        // Implement your actual search logic here
    
        if (!keywords || keywords === "" || keywords === null) {
            return { redirect: true };
        } else {
            keywords = this.checkSearchInput(keywords, "search");
    
            let getAllLessons;

            try {
                const allLessonsData = await lessonsData.getAllLessons();
                // console.log(allLessonsData)
                // allLessonsData = await qaData.getAllQA();


                    //  console.log(allLessonsData)


                const filteredLessons = allLessonsData.filter((lesson) => {
                    const regex = new RegExp(keywords, 'i'); // 'i' for case-insensitive search
    
                    return (
                        regex.test(lesson.title) ||
                        regex.test(lesson.subject) ||
                        regex.test(lesson.handle) ||
                        regex.test(lesson.description) ||
                        regex.test(lesson.createdAt) ||
                        regex.test(lesson.modifiedAt)
                    );
                });
    
                // console.log("START FROM DATA")
                // console.log(filteredLessons);

                // console.log(filteredLessons.length);
    
                return filteredLessons.map((lesson) => ({
                    _id: lesson._id,
                    title: lesson.lessonTitle,
                    subject: lesson.subject,
                    handle: lesson.handle,
                    description: lesson.description,
                    createdAt: lesson.createdAt,
                    modifiedDate: lesson.modifiedAt,
                    upVotes: lesson.upVotes,
                }));
            } catch (e) {
                console.error(`Error in performSearch: ${e.message}`);
                throw new Error('Internal Server Error');
            }
        }
    }


};
export default exportedusersMethods;