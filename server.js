var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var path = require("path");

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

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static(__dirname + "public"));
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

});

app.get("/", function(req, res) {
    db.Article.find({}, function(err, data) {
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    })
})

app.get("/articles", function(req, res) {
    db.Article.find({}).limit(10)
    .then(function(dbArticles){
        res.json(dbArticles);
    })
    .catch(function(err) {
        res.json(err);
    })
});

app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("comment")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.post("/articles/:id", function(req, res) {
      db.Comment.create(req.body)
      .then(function(dbComment) {
          return db.Article.findOneAndUpdate({ _id: req.params.id }), { comment:dbComment.id }, {new: true};
      })
      .then(function(dbArticle) {
          res.json(dbArticle)
      })
      .catch(function(err) {
          res.json(err);
      })
  })
  
  



// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

