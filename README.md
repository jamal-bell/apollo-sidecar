# Apollo-Sidecar
# a cs546-final-project

# GitHub
[Repo] (https://github.com/jamal-bell/apollo-sidecar cs546-final-project Repo")

## Quick start

1. Clone or download the repo
2. run `npm install`
3. run `npm start`
4. run `npm run ./tasks/modifiedseed.js`

The app is built using `nodeJS`. Open [http://localhost:3000](http://localhost:3000) to view it in the browser. 
The seed file will load a variable number of users, lessons, and questions/answers. You can set the numbers at the top of the seed at path /tasks/seed.js

## Built with
- JavaScript
- NodeJS
- mongodb
- Express
- express-server
- express-session
- express-handlebars
- AJAX
- aws-sdk
- HTML
- CSS
- xss
- bcryptjs
- dotenv

# Project Description
The Apollo-Sidecar platform allows faculty and students to easily create, modify, and delete supplemental course lessons. Exceptional students, usually TAs or tutors, can make learning tutorials to help their fellow students. Courses will be tagged based on whether faculty or students created them. Students can also get help from the community of faculty and students and track their learning progress.

# Features
## Core Features
1.	Admin Profiles: Core lesson platform
- Add content
- Text
- Videos
- Organize content
- Add videos
- Edit the lesson
- Publish or keep private
- Advanced Search and Filters

2.	User Profiles: Learning platform
- Register, login, and cancel
- List lesson track and indicate the ones completed
- Track QA posts and number of responses
- Create, edit and remove lessons
- Tagging for faculty based lessons
- Recommendations/Voting
- Advanced Search and Filters

3.	Community Q&A 
- Post
- Comment
- Recommendations/Voting
- Advanced Search and Filters
- Users can search for lessons, tutorials, and Q&A posts based on various criteria like subject, topic, popularity, date, and more, with more advanced capabilities.

## Extra Features Implemented

- Gamificatio: Incentivize users with recognition and goals. IQ Points and progress tracking in user profile.
- User Notifications: Notifications when certain actions are completed.
- Progress Tracking: Provide analytics for users to track their progress and learning performance over time.


### Usage
A note about permissions usage in the app:
Register, Login, and Lessons Library pages are viewable by the public.
Access to lesson detail page, lesson creation are restricted to authenticated users and administrators. Contributions such as posting questions and answers, and upvoting lessons also require users and administrators to be signed in.

## Authors
Christine Anthony
Jamal Bell
Haonan Guan
Jason Wood
