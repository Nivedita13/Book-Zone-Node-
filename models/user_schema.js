    var mongoose              = require("mongoose");
    var bcrypt                =require("bcryptjs");

    var userSchema = new mongoose.Schema({
        username :  String,
        email    :  String,
        type     :  String,
        password : String,
        requested_books : Array,
        books_have  : Array
    });


    module.exports = mongoose.model("User", userSchema);

    module.exports.comparePassword=function(candidatePassword,hash,callback){
        bcrypt.compare(candidatePassword,hash,(err,isMatch)=>{
            if(err) throw err;
            callback(null,isMatch);
        });
    }
    