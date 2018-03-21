//======================
//All require statements
//======================
var express               = require("express"),
    main                  = express(),
    mongoose              = require("mongoose"),
    bodyParser            = require("body-parser"),
    passport              = require("passport"),
    User                  = require("./models/user_schema"),
    books                 = require("./models/books"),
    requested_books       = require("./models/requestedBooks_schema"),
    cors                  = require("cors"),
    JwtStrategy 		  = require('passport-jwt').Strategy,
    jwt                   = require('jsonwebtoken'),
    bcrypt                = require("bcryptjs"),
    ExtractJwt 	          = require('passport-jwt').ExtractJwt;
    

mongoose.connect("mongodb://angularlib:angularlib@ds121089.mlab.com:21089/angularlib");

//mongoose.connect("mongodb://localhost/library",function(err,db){
//     if(err){
//         console.log("Something went wrong");
//     }else{
//         console.log("Server Connected");
//     }
// }); //Connect to database

main.use(cors());

main.use(bodyParser.json());

// main.set("view engine", "ejs");

//======================
//Passport configuration
//======================

main.use(passport.initialize());

main.use(passport.session());

require('./passport')(passport); 
//============================
//Routes
//=============================



// main.get("/", function(req, res){   //main route
//     res.render("start");
// });

// main.get("/decision", function(req, res){  //route to seelct user or admin
//     res.render("decision");
// });

// main.get("/user",isUser, function(req, res){  //user route
//     res.render("user");
// });



//Authentication Routes
main.get("/decision/user_signup", function(req, res){  //user signup route
    res.render("user_signup");
});



main.post("/decision/user_signup",function(req,res)
	{

		
		var newUser=new User(req.body);
        var password=req.body.password;
    


             bcrypt.genSalt(10,(err,salt)=>{
             	bcrypt.hash(password,salt,(err,hash)=>{
             		if(err) throw err;
             		newUser.password=hash;

					 newUser.save((err,user)=>{
						 if(err)
						return res.json({success:false,msg:"This username is already registered !"});
						 if(user)
					    res.json({success:true,msg:"You are Registered"});
						 
					 });
             	});
             });
		
	
	});


main.get("/decision/user_login",passport.authenticate('jwt',{session:false}), function(req, res){  //user login route
    res.json(req.user);
});

main.post("/decision/user_login", passport.authenticate("local",  //handle login route
    {
        successRedirect:"/user",
        failureRediect : "/decision/user_login"
}), function(req, res){ 
    });

main.get("/decision/user_logout",function(req,res)
	{
		req.logout();
		console.log("User Logged Out");
		res.json({success:true,msg:"Successfully Logged Out"})
	});


main.get("/decision/admin_login", function(req, res){ //admin login
    res.render("admin_login");
});

main.post("/decision/login",(req,res,next)=>{
	const username =req.body.username;
	const password =req.body.password;

	User.findOne({username:username},(err,user)=>{
		if(err) 
			{
			res.json({success:false, msg:"Somthing went wrong"});

				throw err;
			}
		if(!user)
		{
			return res.json({success:false, msg:"User not found !"});
		}
		User.comparePassword(password,user.password,(err,isMatch)=>{
		if(err) {
			res.json({success:false, msg:"Somthing went wrong"});
            throw err;
		}

		if(isMatch)
		{
			const token=jwt.sign({data: user},'Hello world',{
				expiresIn:604800  // 1 Week
			});
			res.json({

				success:true,
				msg:"Successfully login",
				token:`Bearer ${token}`,
				user:{
                    userid : user._id,
                    username :  user.username,
                    email    :  user.email,
                    type     :  user.type,
                    password : user.password,
                    requested_books : user.requested_books,
                    books_have  : user.books_have
				}

			});	
		}

		else
		{
			return res.json({success:false,msg:"Wrong password"});
		}


		});
	});

});

main.post("/decision/admin_login", passport.authenticate("local"),function(req, res){ 
    console.log('signin: ',req.body);

    res.json({success: true});
    });

    main.get("/decision/admin_logout",function(req,res)
	{
		req.logout();
		console.log("User Logged Out");
		res.json({success:true,msg:"Successfully Logged Out"})
	});


main.get("/admin", function(req, res){  //admin route
    res.render("admin");
});

main.get("/books_entry", isLoggedin, function(req, res){  //books route
    res.render("books_entry");
});

main.get("/admin/allusers",function(req, res){   // to show all users to admin
        User.find(function(err,allUsers){
            if(err){
                console.log(err);
            }else{
                console.log(allUsers);
                res.json(allUsers);
            }
        });
    });

main.post("/books_entry",passport.authenticate('jwt',{session : false}), function(req, res){ //handles new book entry
    var newBook = new books({
        name    : req.body.name,
        subject : req.body.subject,
        author  : req.body.author,
        id      : req.body.id,
        copies  : req.body.copies
    });
    books.create(newBook, function(err, createdBook){
        if(err){
            console.log(err);
            return res.json({success:false,message:"book is not added"});
        }else{
            console.log("Book Added")
            return res.json(createdBook);
        }
    });
});

main.get("/book/edit/:bookid", function(req, res){
    books.findById(req.params.bookid, function(err, foundBook){
        if(err){
            console.log(err);
            return res.json({success:false,message:"book is not edited"});
        }else{
            console.log("Book Edited")
            return res.json(foundBook);
        }
    });
});

main.put("/book/:bookid", function(req, res){
    console.log(req.body);
    books.findByIdAndUpdate(req.params.bookid,req.body ,function(err, updatedBook){
        if(err){
            console.log(err);
        }else{
            res.json(updatedBook);
        }
    });
});

// main.get("/user_books",isLoggedin ,function(req, res){
//     books.find({},function(err,allBooks){
//         if(err){
//             console.log(err);
//         }else{
//              res.render("user_books",{books:allBooks});
//         }
//     });
// });

main.get("/allbooks", function(req, res){
    books.find({},function(err,allBooks){
        if(err){
            console.log(err);
        }else{
            res.json(allBooks);
        }
    });
});

main.get("/issue/:bookid/:userid", function(req, res){
    console.log('bbbb',req.params.bookid);
    console.log('vvvvvv = >>',req.params.userid);
    var request = {
        user : req.params.userid,
        book : req.params.bookid
    }
    
    requested_books.create(request , function(err, createdRequest){
        if(err){
            console.log(err);
        }
    });

    User.findById(req.params.userid , function(err, foundedUser){
    if(err){
        console.log(err);
    }else{
        foundedUser.requested_books.push(req.params.bookid);
        foundedUser.save();
        books.findById(req.params.bookid, function(err, foundBook){
            if(err){
                console.log(err);
            }else{
                 foundBook.requestedUser.push(req.params.userid);  // pushes user id in requestedBook array of books schema 
                 foundBook.save();   
                //  console.log('aaaaa',foundBook);
                return res.json({"Book" : foundBook, "User" : foundedUser});
                }
        });
    }
});

});



main.get("/admin/requested_books", function(req, res){
    books.find(function(err, foundBooks){
        if(err){
            console.log(err);
        }else{
            res.json(foundBooks);    
        }
    })
});

main.get("/admin/requested_books/:bookid", function(req, res){

    var username = [];
    books.findById(req.params.bookid, function(err, foundBook){
            if(err){
                console.log(err.message);
            }else{
            
                    console.log('from book schema ',foundBook.requestedUser);
                        var users = foundBook.requestedUser;
                        User.find({_id: users }, function(err, users){
                            if(err){
                                console.log(err); 
                            }else{
                                
                                users.forEach((i)=>{
                                    username.push(i);
                                })
                                // res.render("book_profile", {book : foundBook, usersarray : username })
                                res.json({foundBook,username});
                            }
                        });
            }
    });


 });


 main.get("/admin/allow/:bookid/:userid", function(req, res){
    
    user.findById(req.params.userid, function(err, foundUser){
        if(err){
            console.log(err.message);
        }else{
            foundUser.books_have.push(req.params.bookid);
            foundUser.save();
        }
    });
 });


//middleware
function isLoggedin(req, res, next){
    if(req.user)
    {    
    //req.user1=req.user;
       return next();	
    
    }
    else
    {

        res.json({
            success:false,
            msg:"You need to login first !"
        });
    }
}

function isAdmin(req, res, next){
    if(req.user.type == "admin"){
        next();
    }else{
        req.logout();
        req.flash("error","You are not an admin");
        return res.redirect("/decision");
    }
}

function isUser(req, res, next){
    if(req.user.type == "user"){
        next();
    }else{
        req.logout();
        req.flash("error","You are not an user");
        return res.redirect("/decision");
    }
}


//============
//Listen route
//============
main.listen(3000 , function(req, res){
    console.log("SERVER IS STARTED");
});