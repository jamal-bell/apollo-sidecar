


// checks
let lessonForm = document.getElementById("lesson-form");

if (lessonForm) {
  const titleInput = document.getElementById("titleInput");
  const descriptionInput = document.getElementById("descriptionInput");

  lessonForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let title = titleInput.value.trim();
    let description = descriptionInput.value.trim();
    let errorList = "";
    errorContainer.hidden = true;

    //call checks and append to errorList surrounded by try/catch
    try {
      title = helpers.checkInput(title, "lesson title", 3, 250);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      description = helpers.checkInput(
        description,
        "lesson description",
        10,
        2500
      );
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    if (errorList !== "") {
      errorContainer.innerHTML = errorList;
      errorContainer.hidden = false;
      lessonForm.reset();
    } else {
      errorContainer.hidden = true;
      lessonForm.submit();
    }
  });
}

const helpers = {
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== "string") throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },
  //for lesson uploads
  checkInput(strVal, varName, min, max) {
    if (!strVal) throw `You must supply a ${varName}!`;
    if (typeof strVal !== "string") throw `${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `${varName} cannot be an empty string or string with just spaces`;
    if (strVal.length < min || strVal.length > max)
      throw `${varName} length should be between ${min} and ${max} characters.`;
    return strVal;
  },

  checkStringArray(arr, varName) {
    //We will allow an empty array for this,
    //if it's not empty, we will make sure all tags are strings
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${varName}`;
    for (let i in arr) {
      if (typeof arr[i] !== "string" || arr[i].trim().length === 0) {
        throw `One or more elements in ${varName} array is not a string or is an empty string`;
      }
      arr[i] = arr[i].trim();
    }
    return arr;
  },

  checkStringObject(obj, varName) {
    if (!obj) throw `You must provide an object of ${varName}`;
    if (typeof obj !== "object") throw `${varName} must be an object`;
    if (Array.isArray(obj))
      throw `${varName} must be an object, but an array was supplied`;

    for (let k in obj) {
      if (typeof obj[k] !== "string" || obj[k].trim() === "") {
        throw `One or more elements in ${varName} object is not a string or is an empty string`;
      }
      obj[k] = obj[k].trim();
    }
    return obj;
  },
  
  checkArrayObject(obj, varName) {
    if (!obj) throw `You must provide an object of ${varName}`;
    if (typeof obj !== "object") throw `${varName} must be an object`;
    if (Array.isArray(obj))
      throw `${varName} must be an object, but an array was supplied`;

    for (let k in obj) {
      if (!Array.isArray(obj)) {
        throw `One or more elements in ${varName} object is not an array`;
      }
    }
    return obj;
  },
};