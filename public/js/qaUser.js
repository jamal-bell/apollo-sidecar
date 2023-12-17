  const errorSpace = document.getElementById('errorSpace')
  const upvoteButtons = document.querySelectorAll('[id^="upvote-btn-"]');
  const addAnswerForm = document.getElementById('addAnswerForm')

  upvoteButtons.forEach(button => {
    button.addEventListener('click', async function (event) {
      event.preventDefault();
      errorSpace.innerHTML = ""
      errorSpace.hide;
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
          errorSpace.show;
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
            console.error('Error: voteCountElement is null');
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
  errorSpace.hide;

  const qaTarget_id = addAnswerForm.dataset.qatarget;

  const replyText = document.getElementById('replyText').value;
  if (replyText.length < 15 || replyText.length > 10000) {
    errorSpace.innerHTML='Reply must be between 15 and 10,000 characters';
    errorSpace.show;
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
      errorSpace.show;
    } else {
      const responseData = await response.json();
      if (responseData.error) {
        errorSpace.innerHTML= responseData.error;
        errorSpace.show;
        return;
      }
      const answersContainer = document.getElementById('answersContainer');
      const newAnswerDiv = document.createElement('div');
      newAnswerDiv.innerHTML = `
        <div class="vote">
          <div class="iqPoint">${responseData.targetAnswer.votes.value}</div>
          <form class="vote-form" action="/qa/{{qaTarget._id}}/answers/${responseData.targetAnswer._id}" method="post">
            <button type="submit" class="upvote-btn" id="upvote-btn-${responseData.targetAnswer._id}" data-qa-id="${qaTarget._id}" data-answer-id="${responseData.targetAnswer._id}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 2L0 10l3 2v10h18v-10l3-2z"/>
              </svg>
            </button>
          </form>
        </div>
        <div><a href='../../user/handle/${responseData.targetAnswer.author}'>${responseData.targetAnswer.author}</a> at ${responseData.targetAnswer.timeStamp}</div>
        <div>${responseData.targetAnswer.text}</div>
      `;
    answersContainer.appendChild(newAnswerDiv);
    }
  } catch (error) {
    console.error('Error', error);
  }
});