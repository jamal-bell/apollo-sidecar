const errorSpace = document.getElementById('errorSpace')
const upvoteButtons = document.querySelectorAll('[id^="upvote-btn-"]');
const deleteButtons = document.querySelectorAll('[id^="delete-btn-"]');
const addAnswerForm = document.getElementById('addAnswerForm')

//BEGIN LOCKED SECTION
let areLockedResponsesHidden = true; 
let askedBefore = false;
const lockedAnswers = document.querySelectorAll('[data-locked="true"]');
lockedAnswers.forEach(answer => {
  answer.style.display = 'none';
});

function toggleDeletedResponses() {
  if (areLockedResponsesHidden && !askedBefore) {
    const confirmMessage = "This action may expose you to inappropriate or upsetting content. Are you sure you want to proceed?";
    askedBefore = true;
    if (!confirm(confirmMessage)) {
      return; 
    }
  }

  lockedAnswers.forEach(answer => {
    answer.style.display = areLockedResponsesHidden ? '' : 'none';
  });

  areLockedResponsesHidden = !areLockedResponsesHidden;
}

const showDeletedButton = document.getElementById('showDeletedButton');
if (showDeletedButton) {
    showDeletedButton.addEventListener('click', toggleDeletedResponses);
}

// END LOCKED SECTION

upvoteButtons.forEach(button => {
  button.addEventListener('click', async function (event) {
    event.preventDefault();
    errorSpace.innerHTML = ""
    errorSpace.hidden = true;
    const qaId = this.getAttribute('data-qa-id');
    const answerId = this.getAttribute('data-answer-id');

    try {
      
      const response = await fetch(`/qa/${qaId}/answers/${answerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({
          //PASS STUFF IN FORM IF I HAD ANY
        }),
      });

      if (!response.ok) {
        errorSpace.innerHTML = `Voting isn't available right now!`
        errorSpace.hidden = false;
      } else {
        const responseData = await response.json();

        const voteCountElement = this.closest('.vote').querySelector('.iqPoint');

        if (voteCountElement) {
          if (responseData.votedAlready) {
            voteCountElement.innerText = parseInt(voteCountElement.innerText, 10) - 1;
          } else {
            voteCountElement.innerText = parseInt(voteCountElement.innerText, 10) + 1;
          }
        } else {
          errorSpace.innerHTML = `Unable to Locate Vote Element!`
          errorSpace.hidden = false;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

addAnswerForm.addEventListener('submit', async function (event) {
event.preventDefault();
errorSpace.innerHTML = '';
errorSpace.hidden = true;

const qaTarget_id = addAnswerForm.dataset.qatarget;

const replyText = document.getElementById('replyText').value;
if (replyText.length < 15 || replyText.length > 10000) {
  errorSpace.innerHTML='Reply must be between 15 and 10,000 characters';
  errorSpace.hidden = false;
  return;
}

try {
  const response = await fetch(`/qa/${qaTarget_id}/answers`, {
    method: 'POST',
    headers: { 
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      replyText: replyText,
    }),
  });

  if (!response.ok) {
    errorSpace.innerHTML = `Replying isn't available right now!`;
    errorSpace.hidden = false;
  } else {
    const responseData = await response.json();
    if (responseData.error) {
      errorSpace.innerHTML= responseData.error;
      errorSpace.hidden = false;
      return;
    }
    addAnswerForm.reset();
    window.location.reload();
  }
} catch (error) {
  console.error('Error', error);
}
});

deleteButtons.forEach(button => {
  button.addEventListener('click', async function (event) {
    event.preventDefault();
    errorSpace.innerHTML = ""
    errorSpace.hidden = true;
    const qaId = this.getAttribute('data-qa-id');
    const answerId = this.getAttribute('data-answer-id');

    try {
      
      const response = await fetch(`/qa/${qaId}/answers/${answerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({
          //PASS STUFF IN FORM IF I HAD ANY
        }),
      });

      if (!response.ok) {
        errorSpace.innerHTML = `Sorry Teach, can't delete right now..`
        errorSpace.hidden = false;
      } else {
        const responseData = await response.json();
        if (responseData.error) {
          errorSpace.innerHTML= responseData.error;
          errorSpace.hidden = false;
          return;
        }

        const answerDiv = this.closest('.answer');

        if (answerDiv) {
          if (areLockedResponsesHidden) {
            answerDiv.dataset.locked = true;
            answerDiv.innerHTML = `
            <div>Deleted</div>
            <div>[Marked for Deletion. Text is temporarily unavailable]</div>
         `;
      }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});