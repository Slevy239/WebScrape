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

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Set Handlebars.
var exphbs = require("express-handlebars");


// Make public a static folder
app.use(express.static("public"));


// initalize express-handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main",
        partialsDir: path.join(__dirname, "/views/layouts/partials")
    })
); app.set("view engine", "handlebars");


app.set("view engine", "handlebars");

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses


// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/NYTdb", { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connect(
  
    process.env.MONGOD_URI || "mongodb://user2:password1@ds111648.mlab.com:11648/heroku_cgsdbdp0",
  
);

// mongoose.connect(MONGOD_URI);


app.get("/scrape", function (req, res) {

    axios.get("https://www.nytimes.com/section/sports").then(function (response) {
        var $ = cheerio.load(response.data);
        $("article").each(function (i, element) {
            var result = {};


            summary = ""
            if ($(this).find("ul").length) {
                summary = $(this).find("li").first().text();
            } else {
                summary = $(this).find("p").text();
            };

            result.title = $(this).find("h2").text();
            result.summary = summary;
            result.link = "https://www.nytimes.com" + $(this).find("a").attr("href");

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


//FIND ALL AND DISPLAY AT ROOT
app.get("/", function (req, res) {
    db.Article.find({}, function (err, data) {
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("home", hbsObject);
    })
})

//DISPLAY SAVED 
app.get("/saved", function (req, res) {
    db.Article.find({
        "saved": true
    }).populate("comments").exec(function (error, articles) {
        var hbsObject = {
            article: articles
        };
        res.render("saved", hbsObject);

    })
})

//FIND FIRST 10 ARTICLES IN DB
app.get("/articles", function (req, res) {
    db.Article.find({}).limit(10)
        .then(function (dbArticles) {
            res.json(dbArticles);
        })
        .catch(function (err) {
            res.json(err);
        })
});

//POPULATE COMMENTS
app.get("/saved/comments/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("comments")
        .then(function (comments) {
            res.send(comments);
        })
        .catch(function (err) {
            res.json(err);
        });
});


//SAVE ARTICLE
app.post("/articles/save/:id", function (req, res) {

    db.Article.findOneAndUpdate({ _id: req.params.id }, { "saved": true })
        .then(function (err, dbArticle) {
            if (err) {
                console.log(err)
            } else {
                res.send(dbArticle)
            }
        })
})

//DELETE ARTICLE FROM SAVED
app.post("/articles/delete/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { "saved": false, "comments": [] })
        .exec(function (err, dbArticle) {
            if (err) {
                console.log(err)
            } else {
                res.send(dbArticle);
            }
        })
});

//CREATE A NEW COMMENT
app.post("/saved/comments/:id", function(req, res){
    db.Comment.create(req.body).then(function(dbNote){
        // find id inside of Article collection and push the associated comments into the Article
        return db.Article.findOneAndUpdate({_id: req.params.id}, {$push: {comments: dbNote._id}}, {new: true});
    }).then(function(dbArticle){
        res.json(dbArticle);
    }).catch(function(err){
        if(err) {
            res.json(err);
        }
    });
})

//DELETE COMMENT FROM MODAL
app.get("/delete/comments/:id", function(req, res){
    db.Comment.remove({_id: req.params.id}).then(function(response){
        console.log(response)
        res.json(response);
    })
});





// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

