# cs546-final-project

Description

## Quick start

1. Clone or download the repo
2. run `npm install`
3. run `npm start`
4. run `npm run seed`

## Seeding the database

The seed file will load a variable number of users, lessons, and questions/answers. You can set the numbers at the top of the seed at path /tasks/seed.js

## Permissions

Register, Login, and Lessons Library pages are viewable by the public.
Access to lesson detail page, lesson creation are restricted to authenticated users and administrators. Contributions such as posting questions and answers, and upvoting lessons also require users and administrators to be signed in.
