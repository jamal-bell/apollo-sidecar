document.addEventListener('DOMContentLoaded', function () {
  const upvoteButtons = document.querySelectorAll('.upvote-btn');

  upvoteButtons.forEach((button) => {
    button.addEventListener('click', async function (event) {
      event.preventDefault();

      const qaId = this.getAttribute('data-qa-id');
      const answerId = this.getAttribute('data-answer-id');

      try {
        const response = await fetch(`/qa/${qaId}/answers/${answerId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          alert('Error upvoting. Please try again later.');
          console.error('Error:', response.statusText);
        } else {
          const voteCountElement =
            this.closest('.vote').querySelector('.iqPoint');
          const currentVoteCount = parseInt(voteCountElement.innerText, 10);
          voteCountElement.innerText = currentVoteCount + 1;
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });
});
