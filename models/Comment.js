var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema ({
    body: { 
        type: String
    },
    article: {
        type: Schema.Types.ObjectId,
        ref: "Article"
    }
});

var Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
