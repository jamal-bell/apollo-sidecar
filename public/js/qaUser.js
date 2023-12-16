let errors = [];
let addAnswerForm = document.getElementById('addAnswerForm');
let errorSpace = document.getElementById('errorSpace');

if (addAnswerForm) {
  const form = addAnswerForm;
  errors = [];
  form.addEventListener('submit', (event) => {
    errorSpace.innerHTML = '';
    replyText = document.getElementById('replyText');
    replyText_trimmed = replyText.value.trim();
    if (replyText_trimmed <= 15)
      errors.push('Reply must be at least 15 characters.');
    if (replyText_trimmed > 10000)
      errors.push('Reply must be less than 10k characters.');
    if (errors.length > 0) {
      event.preventDefault();
      let errorsList = document.createElement('ul');
      errors.forEach((element) => {
        let listItem = document.createElement('li');
        listItem.classList.add('errorSpace');
        listItem.innerHTML = element;
        errorsList.appendChild(listItem);
      });
      errorSpace.appendChild(errorsList);
      errors = [];
    }
  });
}
