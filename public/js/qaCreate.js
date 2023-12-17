const addQaForm = document.getElementById('addQaForm');
const errorSpace = document.getElementById('errorSpace');

addQaForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  
  errorSpace.innerHTML = '';
  errorSpace.style.display = 'none';

  const lessonId = addQaForm.dataset.lessonid;
  
  let problemArray = [];
  const qaTitle = document.getElementById('qaTitle');
  if (qaTitle.value.length < 10 || qaTitle.value.length > 50) {
    problemArray.push("QA title must be between 10 and 50 characters.");
  }
  const qaText = document.getElementById('qaText');
  if (qaText.value.length < 15 || qaText.value.length > 10000) {
    problemArray.push("QA text must be between 15 and 10000 characters.");
  }
  if (problemArray.length > 0) {
    errorSpace.style.display = '';
    const problemsList = document.createElement('ul');
    problemArray.forEach(problem => {
      const listItem = document.createElement('li');
      listItem.textContent = problem;
      problemsList.appendChild(listItem);
    });
    errorSpace.appendChild(problemsList);
    return;
  }
try {
  const response = await fetch(`qa/create/${lessonId}`, {
    method: 'POST',
    headers: { 
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      qaText: qaText,
      qaTitle: qaTitle
    }),
  });

  if (!response.ok) {
    errorSpace.innerHTML = `Cannot ask a question right now! Shhh`;
    errorSpace.style.display='';
  } else {
    const responseData = await response.json();
    if (responseData.error) {
      errorSpace.innerHTML= responseData.error;
      errorSpace.style.display = '';
      return;
    }

  }
} catch (error) {
  console.error('Error', error);
}})
