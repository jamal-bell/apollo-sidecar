import express from "express";

const app = express();

import configRoutFunction from "./routes/index.js";

configRoutFunction(app);

app.listen(3000, () => {
  console.log("We've got a server!");
  console.log("Our routes are running on http://localhost:3000");
});
