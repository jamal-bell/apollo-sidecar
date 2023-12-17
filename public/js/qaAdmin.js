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
    /* ADDING DYNAMICALLY HAVING ISSUES, RELOAD WINDOW INSTEAD 
    const answersContainer = document.getElementById('answersContainer');
    const newAnswerDiv = document.createElement('div');
    newAnswerDiv.classList.add('vote')
    let newAnswer = `
      <div class="iqPoint">${responseData.targetAnswer.votes.value}</div>
      <form class="vote-form" action="/qa/${qaTarget_id}/answers/${responseData.targetAnswer._id}" method="post">
        <button type="submit" class="upvote-btn" id="upvote-btn-${responseData.targetAnswer._id}" data-qa-id="${qaTarget_id}" data-answer-id="${responseData.targetAnswer._id}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 2L0 10l3 2v10h18v-10l3-2z"></path>
          </svg>
        </button>
      </form>
    </div>
    <div><a href="../../user/handle/${responseData.targetAnswer.author}">${responseData.targetAnswer.author}</a> at ${responseData.targetAnswer.timeStamp}</div>
    <div>${responseData.targetAnswer.text}
  `; 
    newAnswerDiv.innerHTML= newAnswer
    answersContainer.appendChild(newAnswerDiv);
    */
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