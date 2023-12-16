async function upVoteLesson(docId) {
    try {
      const response = await fetch(`/lessons/upvote//${docId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const result = await response.json();
  
      if (result.success) {
        alert('Value incremented successfully!');
      } else {
        alert(`Failed to increment value: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }