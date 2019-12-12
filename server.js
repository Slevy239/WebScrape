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
mongoose.connect("mongodb://localhost/NYTdb", { useNewUrlParser: true });
var MONGOD_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGOD_URI);

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
            result.summary =summary;
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
//FIND ALL
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
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ "_id": req.params.id })
        .populate("comment")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});


//SAVE ARTICLE
app.post("/articles/save/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { "saved": true }).exec(function (err, doc) {
        if (err) {
            console.log(err)
        } else {
            res.send(doc)
        }
    })
})
//DELETE ARTICLE FROM SAVED
app.post("/articles/delete/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { "saved": false, "notes": [] }).exec(function (err, doc) {
        if (err) {
            console.log(err)
        } else {
            res.send(doc);
        }
    })
});

//CREATE A NEW NOTE
app.post("/comments/save/:id", function (req, res) {
    db.Comment.create(req.body).then(function(dbComment) {
        return db.Article.findOneAndUpdate({ _id: req.params.id}, {comment: dbComment._id}, {new: true});
    }).then(function(dbArticle){
        res.json(dbArticle);
    }).catch(function(err) {
        res.json(err);
    })
})
//     var newComment = new Comment({
//         body: req.body.text,
//         article: req.params.id
//     });
//     console.log(req.body)
//     newComment.save(function (err, comment) {
//         if (err) {
//             console.log(err)
//         } else {
//             db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { "comments": comment } }).exec(function (err) {
//                 if (err) {
//                     console.log(err)
//                     res.send(err)
//                 } else {
//                     res.send(comment)
//                 }
//             })
//         }
//     })
// })





// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

