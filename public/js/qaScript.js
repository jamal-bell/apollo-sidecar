let errors = [];
let answerForm = document.getElementById('addAnswerForm');
let qaForm = document.getElementById('addQaForm');
let deleteAnswerForm = document.getElementById('deleteAnswerForm');
let deleteQaForm = document.getElementById('deleteQaFOrm');
let errorSpace = document.getElementById('errorSpace');

if (answerForm) {
  answerFormErrors = [];
  let textInput = document.getElementById('replyText');
  answerForm.addEventListener('submit', (event) => {
    errorSpace.innerHTML = '';
    let textInput_trimmed = textInput.value.value.trim();
    if (!textInput_trimmed) {
      answerFormErrors.push('Answer must have some text!');
    }
    if (textInput_trimmed.length < 15 || textInput_trimmed > 10000) {
      answerFormErrors.push(
        'Answer should at least be 15 characters to contribute, and less than 10,000'
      );
    }
    if (answerFormErrors.length > 0) {
      event.preventDefault();
      let errorsList = document.createElement('ul');
      answerFormErrors.forEach((element) => {
        let listItem = document.createElement('li');
        listItem.classList.add('errorSpace');
        listItem.innerHTML = element;
        errorsList.appendChild(listItem);
      });
      errorSpace.appendChild(errorsList);
      answerFormErrors = [];
    }
  });
}

if (qaForm) {
  qaFormErrors = [];
  qaForm.addEventListener('submit', (event) => {
    errorSpace.innerHTML = '';
    let textInput = document.getElementById('qaText');
    let titleInput = document.getElementById('qaTitle');
    let contentId = document.getElementById('contentId');

    if (!contentId) {
      qaFormErrors.push('Lesson content selected must be valid');
    }
    const textInput_trimmed = textInput.value.trim();
    const titleInput_trimmed = titleInput.value.trim();
    if (!titleInput_trimmed) {
      qaFormErrors.push('Title must be included');
    }
    if (titleInput_trimmed.length <= 10) {
      qaFormErrors.push('Title must be at least 10 characters');
    }
    if (titleInput_trimmed.length >= 50) {
      qaFormErrors.push('Title must be most 50 characters.');
    }

    if (!textInput_trimmed) {
      qaFormErrors.push('Some text must be included entire question.');
    } else {
      if (textInput_trimmed <= 25 || textInput_trimmed > 10000) {
        qaFormErrors.push(
          'Text should be at least than 25 characters, and less than 10,000.'
        );
      }
    }
    if (qaFormErrors.length > 0) {
      event.preventDefault();
      let errorsList = document.createElement('ul');
      qaFormErrors.forEach((element) => {
        let listItem = document.createElement('li');
        listItem.classList.add('errorSpace');
        listItem.innerHTML = element;
        errorsList.appendChild(listItem);
      });
      errorSpace.appendChild(errorsList);
      qaFormErrors = [];
    }
  });
}

if (deleteAnswerForm) {
  const form = deleteAnswerForm;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const confirmation = confirm(
      'Are you sure you want to delete this answer?'
    );
    if (confirmation) {
      const response = await fetch(form.action, {
        method: 'DELETE',
      });
    }
  });
}

if (deleteQaForm) {
  deleteQaForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const confirmation = confirm(
      'Are you sure you want to delete this answer?'
    );
    if (confirmation) {
      const response = await fetch(deleteQaForm.action, {
        method: 'DELETE',
      });
    }
  });
}
