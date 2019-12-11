var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser")

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses



// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/FlyersDb", { useNewUrlParser: true });


app.get("/scrape", function (req, res) {

    axios.get("https://www.espn.com/nhl/team/_/name/phi").then(function (response) {
        var $ = cheerio.load(response.data);
        $("article a").each(function (i, element) {
            var result = {};

            result.title = $(element).attr("aria-label")
            result.link = "https://www.espn.com/" + $(this).attr("href");
            // result.img = $(element).children().attr("src")

            db.Article.create(result)
                .then(function (dbArticles) {
                    console.log(result);
                })
                .catch(function (err) {
                    console.log(err)
                })
        });
        // console.log(result);
        res.send("Scrape Complete")
    });

})

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

