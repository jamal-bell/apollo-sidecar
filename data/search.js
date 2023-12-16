
import lessonsData from "./lessons.js"

const exportedusersMethods = {
    checkSearchInput(strVal, varName) {
        if (typeof strVal !== "string") throw `Error: The ${varName} field only accepts strings`;
        strVal= strVal.trim();
        if (!isNaN(strVal)) throw `Error: Your ${varName} input is not a valid as it only contains digits`;
        
        // const regex = /[!@#$%^&*(),.?":{}|<>]/;
        // const hasSpecialChar = regex.test(strVal);
        // if(hasSpecialChar) throw `[!@#$%^*(),.":{}|<>] `
        return strVal
    },

    async performSearch (keywords) {
    // Implement your actual search logic here

        if (!keywords || keywords === "" || keywords === null ) {
            return {redirect: true}
        } else {

            // if(docType !== "lessons" || docType !== 'qa' || docType !== "both") throw `Do not tamper with the searchType filter.`
            // if(sortOrder !== "newest" || sortOrder !== 'oldest') throw `Do not tamper with the order filter.`
            
            keywords =this.checkSearchInput(keywords, "search");

            let allLessonsData;

            try {
                allLessonsData = await lessonsData.getAllLessons();
                // console.log(allLessonsData)
                // allLessonsData = await qaData.getAllQA();
            } catch(e) {
                throw `There is an error getting lesson data from the database`
            }

            const filteredLessons = allLessonsData.filter((lesson) => {
                const regex = new RegExp(keywords, 'i'); // 'i' for case-insensitive search
            
                return (
                regex.test(lesson.title) ||
                regex.test(lesson.subject) ||
                regex.test(lesson.author) ||
                regex.test(lesson.description) ||
                regex.test(lesson.createdAt) ||
                regex.test(lesson.modifiedAt)
                );
              });

            // console.log(filteredLessons);

              return filteredLessons.map((lesson) => ({
                _id: lesson._id,
                title: lesson.lessonTitle,
                subject: lesson.subject,
                author: lesson.author,
                description: lesson.description,
                createdAt: lesson.createdAt,
                modifiedDate: lesson.modifiedAt,
                upVotes: lesson.upVotes,
              }));


        } // end else
    },

    async performAdvancedSearch (keywords, docType, sortOrder, page, pageSize) {


        let results = [];

        if (docType === 'lessons') {
            results = allLessonsData.filter((lesson) => lesson.description.includes(keywords));
        } else if (docType === 'qa') {
            results = allQAData.filter((qa) => qa.text.includes(keywords));
        } else {
            // Combine results from both documents
            results = [
            ...lessonsData.filter((lesson) => lesson.description.includes(keywords)),
            ...qaData.filter((qa) => qa.text.includes(keywords)),
            ];
        }

        // Sort results based on sortOrder (newest or oldest)
        if (sortOrder === 'newest') {
            results.sort((a, b) => b.date - a.date);
        } else if (sortOrder === 'oldest') {
            results.sort((a, b) => a.date - b.date);
        }

        return results;
    }
};
export default exportedusersMethods;