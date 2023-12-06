//pull in valiation functions

import { lessons } from "../../config/mongoCollections";

// checks

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

    if (errorList !== "") {
      errorContainer.innerHTML = errorList;
      errorContainer.hidden = false;
      lessonForm.reset();
    } else {
      errorContainer.hidden = true;
      lessonForm.submit();
    }
  })
}
