import express from "express";
const app = express();
import configRoutes from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import exphbs from "express-handlebars";
import middlewareUser from "./middleware-user.js";
import middlewareLessons from "./middleware-lessons.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticDir = express.static(__dirname + "/public");

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === 'number')
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
      return new Handlebars.SafeString(JSON.stringify(obj));
    },
    isArray: function (value) {
      return Array.isArray(value);
    },
  },
  partialsDir: ['views/partials/']
});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  next();
});

app.use("/public", staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);


app.engine('handlebars', handlebarsInstance.engine);
app.set("view engine", "handlebars");

middlewareUser.session(app);
middlewareUser.user(app);
middlewareLessons.lesson(app);
middlewareUser.qa(app);
middlewareUser.home(app);

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
