var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema ({
    tite: String,
    body: String
});

var Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
