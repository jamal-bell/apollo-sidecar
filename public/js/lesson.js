// checks
let lessonForm = document.getElementById("lesson-form");
let moduleForm = document.getElementById("module-form");

if (lessonForm) {
  const titleInput = document.getElementById("titleInput");
  const descriptionInput = document.getElementById("descriptionInput");
  const errorContainer = document.getElementById("errors");

  lessonForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let title = titleInput.value.trim();
    let description = descriptionInput.value.trim();
    let errorList = "";
    errorContainer.hidden = true;

    //call checks and append to errorList surrounded by try/catch
    try {
      title = helpers.checkContent(title, "lesson title", 3, 250);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      description = helpers.checkContent(
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

if (moduleForm) {
  const orderInput = document.getElementById("orderInput");
  const moduleTitleInput = document.getElementById("moduleTitleInput");
  const textInput = document.getElementById("textInput");
  const videoLinkInput = document.getElementById("videoLinkInput");
  const errorContainer = document.getElementById("errors");

  moduleForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let order = orderInput.value?.trim();
    let moduleTitle = moduleTitleInput.value?.trim();
    let text = textInput.value?.trim();
    let videoLink = videoLinkInput.value?.trim();
    let errorList = "";
    errorContainer.hidden = true;

    //call checks and append to errorList surrounded by try/catch
    try {
      if (order) order = helpers.checkIsPositiveNum(order, "order");
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }

    try {
      moduleTitle = helpers.checkContent(moduleTitle, "module title", 10, 250);
    } catch (e) {
      errorList += `<li>${e}</li>`;
    }
    //TODO finish checks
    if (errorList !== "") {
      errorContainer.innerHTML = errorList;
      errorContainer.hidden = false;
      moduleForm.reset();
    } else {
      errorContainer.hidden = true;
      moduleForm.submit();
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
  checkContent(strVal, varName, min, max) {
    if (!strVal) throw `You must supply a ${varName}!`;
    if (typeof strVal !== "string") throw `${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `${varName} cannot be an empty string or string with just spaces`;
    if (strVal.length < min || strVal.length > max)
      throw `${varName} length should be between ${min} and ${max} characters.`;
    return strVal;
  },

  checkIsPositiveNum(val, varName) {
    if (!val) throw `Error: You must supply a ${varName}!`;
    if (typeof val !== "number" || val < 0) {
      throw `${varName || "provided variable"} needs to be a positive integer`;
    }
    if (isNaN(val)) {
      throw `${varName || "provided variable"} is NaN`;
    }
    return val;
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
