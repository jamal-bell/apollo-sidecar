(function ($) {
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
  
  let lessonForm = document.getElementById("lesson-form");
  let moduleForm = document.getElementById("module-form");

  if (lessonForm) {
    const titleInput = document.getElementById("titleInput");
    const descriptionInput = document.getElementById("descriptionInput");
    const moduleTitleInput = document.getElementById("moduleTitleInput");
    const textInput = document.getElementById("textInput");
    const videoLinkInput = document.getElementById("videoLinkInput");
    const errorContainer = document.getElementById("errors");

    lessonForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let title = titleInput.value.trim();
      let description = descriptionInput.value.trim();
      let moduleTitle = moduleTitleInput.value.trim();
      let text = textInput.value.trim();
      let videoLink = videoLinkInput.value.trim();

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

      if (moduleTitle !== "") {
        try {
          moduleTitle = helpers.checkContent(
            moduleTitle,
            "module title",
            10,
            250
          );
        } catch (e) {
          errorList += `<li>${e}</li>`;
        }
        try {
          if (text)
            text = helpers.checkContent(text, "module content", 20, 60000);
        } catch (e) {
          errorList += `<li>${e}</li>`;
        }
        try {
          if (videoLink)
            videoLink = helpers.checkString(videoLink, "video link");
        } catch (e) {
          errorList += `<li>${e}</li>`;
        }
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

    //const errorContainer = document.getElementById("errorsDiv");

    const newModuleButton = document.getElementById("newModuleButton");
    const publishButton = document.getElementById("newModuleButton");
    const lessonIdInput = document.getElementById("lessonId");

    newModuleButton.addEventListener("click", (e) => {
      e.preventDefault();
      let order = orderInput.value?.trim();
      let moduleTitle = moduleTitleInput.value?.trim();
      let text = textInput.value?.trim();
      let videoLink = videoLinkInput.value?.trim();
      let errorList = "";
      errorContainer.hidden = true;
      let lessonId = lessonIdInput.value;

      //call checks and append to errorList surrounded by try/catch
      try {
        moduleTitle = helpers.checkContent(moduleTitle, "module title", 3, 250);
      } catch (e) {
        errorList += `<li>${e}</li>`;
        //errorList += `${e}`;
      }

      try {
        if (text)
          text = helpers.checkContent(text, "module content", 10, 60000);
      } catch (e) {
        errorList += `<li>${e}</li>`;
      }

      try {
        order = parseInt(order);
        order = helpers.checkIsPositiveNum(order, "order");
      } catch (e) {
        errorList += `<li>${e}</li>`;
      }

      try {
        if (videoLink) videoLink = helpers.checkString(videoLink, "video link");
      } catch (e) {
        errorList += `<li>${e}</li>`;
      }

      if (errorList !== "") {
        errorContainer.innerHTML = errorList;
        errorContainer.hidden = false;
        moduleForm.reset();
      } else {
        errorContainer.hidden = true;
      }

      let requestConfig = {
        method: "POST",
        url: `/lessons/addmodule/${lessonId}`,

        contentType: "application/json",
        data: JSON.stringify({
          lessonId: lessonId,
          moduleTitle: moduleTitle,
          text: text,
          videoLink: videoLink,
          order: order,
        }),
      };
      $.ajax(requestConfig)
        .then(function (response) {
          if (response.hasErrors) {
            errorContainer.html(response.errors);
            errorContainer.show();
          } else if (response.updated) {
            moduleTitle = response.moduleTitle;
            text = response.text;
            order = response.order;
            videoLink = response.videoLink;

            const contentsList = document.getElementById("contentList");
            let li = document.createElement("li");

            //   li.textContent = `{{{<h4>${order}: ${this.moduleTitle}</h4>
            //   <h5>Resources:${this.videoLink}</h5>
            //   <h5>Content: ${this.text}</h5>
            // }}}`;

            li.innerHTML = `
            <h4>${order}: ${moduleTitle}</h4>
            <h5>Video Resource: <a href="${videoLink}" target="_blank">${videoLink} </a></h5>
            <h5>Content: ${text}</h5>
          `;

            contentsList.appendChild(li);
            //------------------------------------------------------------------------------
            // const contentsList = document.getElementById("contentList");
            // const li = document.createElement("li");

            //   // Assuming you have a Handlebars template with placeholders like {{order}}, {{moduleTitle}}, etc.
            //   const template = `
            //   <h4>{{order}}: {{this.moduleTitle}}</h4>
            //   <h5>Resources: {{this.videoLink}}</h5>
            //   <h5>Content: {{this.text}}</h5>
            // `;

            //   const templateFunction = Handlebars.compile(template);

            //   // Replace the placeholders with your actual data
            //   const html = templateFunction({
            //     order: order, // replace with your actual order variable
            //     moduleTitle: moduleTitle, // replace with your actual moduleTitle variable
            //     videoLink: videoLink, // replace with your actual videoLink variable
            //     text: text, // replace with your actual text variable
            //   });
            //   console.log("html template: " + html);
            //   // Set the compiled HTML as the content of the list item
            //   li.innerHTML = html;

            //   // Append the list item to the contentList
            //   contentsList.appendChild(li);

            orderInput.value = "";
            moduleTitleInput.value = "";
            textInput.value = "";
            videoLinkInput.value = "";

            //errorContainer.empty();
            errorContainer.hide(); //.empty or .hide???
            errorContainer.appendChild(`<p>Module Created!</p>`);
          }
        })
        .catch(function (e) {
          errorList.push(`<li>${e}</li>`);
          //errorList.push(`${e}`);
          errorContainer.show();
        });
    });
  } //end form

  const launchButton = document.getElementById("launchButton");
  launchButton.addEventListener("click", (e) => {
    e.preventDefault();
    //launchButton.hide();
    $("#launchButton").hide();
  });
})(jQuery);
// }

//   const completeButton = document.getElementById("completeButton");
//   launchButton.addEventListener("click", addLesson);
//   const publishButton = document.getElementById("publishButton");
//   launchButton.addEventListener("click", addLesson);

