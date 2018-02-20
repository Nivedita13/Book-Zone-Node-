var mongoose = require("mongoose");

var requestedSchema = new mongoose.Schema({
    user : String,
    book : String
});

module.exports = mongoose.model("Requested_books", requestedSchema);