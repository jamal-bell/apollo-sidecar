import homeRoutes from "./home.js";
import lessonRoutes from "./lessons.js";
import qaRoutes from "./qa.js";
import userRoutes from "./user.js";
import searchRoutes from "./search.js"
import searchResultsRoutes from "./search.js";

const constructorMethod = (app) => {
  app.use("/", homeRoutes);
  app.use("/lessons", lessonRoutes);
  app.use("/qa", qaRoutes);
  app.use("/user", userRoutes);
  app.use("/search", searchRoutes);
  app.use("/searchresults", searchResultsRoutes);
  app.use("*", (req, res) => {
    res.status(404).render("error", { errorMessage: `404` });
  });
};

export default constructorMethod;