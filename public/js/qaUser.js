  errorSpace = document.getElementById('errorSpace')
  // Add a click event listener to all upvote buttons
  const upvoteButtons = document.querySelectorAll('[id^="upvote-btn-"]');
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
          // You can include a request body if needed
          body: JSON.stringify({
            // Add any additional data you need to send
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
