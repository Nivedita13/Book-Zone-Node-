var mongoose              = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username :  String,
    email    :  String,
    type     :  String,
    password : String,
    requested_books : Array,
    books_have  : Array
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);