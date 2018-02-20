var mongoose = require("mongoose");

//books schema
var bookSchema = new mongoose.Schema({
    subject : String,
    name    : String,
    author  : String,
    id      : String,
    copies  : Number,
    requestedUser : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }]
});


//export model
module.exports = mongoose.model("books", bookSchema);
    