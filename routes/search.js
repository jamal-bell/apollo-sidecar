import { paginateListObjectsV2 } from "@aws-sdk/client-s3";
import searchFunction from "../data/search.js"
import express, { query } from "express";
import { Router } from "express";
import xss from 'xss';
import { ServerHeartbeatStartedEvent } from "mongodb";
const app = express();
const router = Router();

router.route("/").get(async(req, res) => {

  res.status(200).render("pages/search", {title: "Search", style_partial: "css_search",});
})
.post(async (req, res) => {
    try {
        const searchTerm = xss(req.body.keywords || "");
        const docType = xss(req.query.doctype || "all"); // Default to "all"
        const sortOrder = xss(req.query.sortorder || "asc"); // Default to "asc"
        const searchCount = xss(req.query.searchcount || 10); // Default to 10
        const startDate = xss(req.query.startdate || null);
        const endDate = xss(req.query.enddate || null);
        const page = parseInt(req.body.page) || 1;
        const pageSize = 10;
    
        const searchResults = await searchFunction.performSearch(searchTerm,docType,sortOrder,startDate,endDate,searchCount);
    
        if (searchResults.redirect) {
            // Redirect if needed
            return res.redirect("/search");
        }
    
        const totalItems = searchResults.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
    
        // Check if searchResults is an array before slicing
        const paginatedResults = Array.isArray(searchResults)
            ? searchResults.slice(startIndex, startIndex + pageSize)
            : [];
    
            // console.log(paginatedResults);
    
        res.status(200).render("pages/search", {
            title: "Search Results",
            searchTerm,
            lessons: paginatedResults,
            style_partial: "css_search",
            leftmenu_partial: "html_search",  // Make sure this is correct
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



//===============================================
router.route("/searchresults")
.post(async (req, res) => {
try {
    const searchTerm = xss(req.body.keywords || "");
    const page = parseInt(req.body.page) || 1;
    const pageSize = 10;

    const searchResults = await searchFunction.performSearch(searchTerm);

    if (searchResults.redirect) {
        // Redirect if needed
        return res.redirect("/search");
    }

    const totalItems = searchResults.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;

    console.log(searchTerm)
    // Check if searchResults is an array before slicing
    const paginatedResults = Array.isArray(searchResults)
        ? searchResults.slice(startIndex, startIndex + pageSize)
        : [];

        // console.log("START FROM ROUTE")
        // console.log(paginatedResults); // CONSOLE LOG HERE

    res.status(200).render("pages/searchResults", {
        title: "Search Results",
        searchTerm,
        lessons: paginatedResults,
        style_partial: "css_search",
        leftmenu_partial: "html_search",  // Make sure this is correct
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
