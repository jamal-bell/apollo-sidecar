import searchFunction from "../data/search.js"
import express, { query } from "express";
import { Router } from "express";
import xss from 'xss';
const app = express();
const router = Router();

router.route("/").get(async(req, res) => {
//   const searchword = req.params.keywords
  
//   console.log("searchTerm:" + searchword);
  res.status(200).render("pages/search", {title: "Search", heading:"Search Lesssons and the QAs"});
});

  
router.route("/searchresults").post(async (req, res) => {
//   const searchInput = req.body.keywords; // || "");

//   console.log("keywords: " + searchInput);

const searchTerm = xss(req.body.keywords|| ""); // Access the search term from the request body
const page = parseInt(req.body.page) || 1; // Access the page number from the request body
const pageSize = 5; // Number of items per page
const docType = "lessons";
const sortOrder = "newest";

if (!searchTerm) 
res.status(200).render("pages/search", { title: "Search", errorMessage: "You must enter a search term" });
// else
// res.status(200).render("pages/searchResults", { title: "Search Results", keyword: `You searched for ${searchTerm}` });

try {
  // Get search results based on the searchTerm, page, and pageSize
//   const searchResults = await lessonsData.getLessonBySearchTerm(searchTerm);
  const searchResults = await searchFunction.performSearch (searchTerm);

//   console.log(searchResults);

  // Paginate the results
  const totalItems = searchResults.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedResults = searchResults.slice(startIndex, startIndex + pageSize);

  console.log(paginatedResults);

  res.render("pages/searchResults", {
    title: "Search Results",
    searchTerm,
    lessons: paginatedResults,
    pagination: {
      currentPage: page,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
} catch (error) {
  console.error(`Error in search route: ${error.message}`);
  res.status(500).render("error", { errorMessage: "Internal Server Error" });
}

});

export default router


// router.get('/', (req, res) => {
//     res.render('search/form');
//   });
  
//   router.post('/searchresults', (req, res) => {
//     const { keywords, documentType, sortOrder } = req.body;
  
//     // Call the performSearch function with user input
//     const results = performSearch(keywords, documentType, sortOrder);
  
//     res.render('search/searchResults', { results, documentType, sortOrder });
//   });