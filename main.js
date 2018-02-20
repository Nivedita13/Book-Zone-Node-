//======================
//All require statements
//======================
var express               = require("express"),
    main                  = express(),
    mongoose              = require("mongoose"),
    bodyParser            = require("body-parser"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    user                  = require("./models/user_schema"),
    admin                 = require("./models/admin_schema"),
    books                 = require("./models/books");
    requested_books       = require("./models/requestedBooks_schema"),
    methodOverride       = require("method-override"); 
    

mongoose.connect("mongodb://Nivedita:nivedita@ds239047.mlab.com:39047/library_mgmt"); //Connect to database
main.use(bodyParser.urlencoded({extended : true}));   
main.set("view engine", "ejs");
main.use(methodOverride("_method"));

//======================
//Passport configuration
//======================
main.use(require("express-session")({
    secret : "COCO is damn cute",
    resave : false,
    saveUninitialized : false
}));

main.use(passport.initialize());
main.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

main.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
 });
 
//============================
//Routes
//=============================
main.get("/", function(req, res){   //main route
    res.render("start");
});

main.get("/decision", function(req, res){  //route to seelct user or admin
    res.render("decision");
});

// main.get("/new", function(req, res){  
//     res.render("new");
// });

// main.post("/new", function(req, res){
//     r
// });

main.get("/user", function(req, res){  //user route
    res.render("user");
});

//Authentication Routes
main.get("/decision/user_signup", function(req, res){  //user signup route
    res.render("user_signup");
});

main.post("/decision/user_signup", function(req, res){ //to handle user sign up
    var newUser = new user({
        username : req.body.username,
        email    : req.body.email,
        type    : "user"
    });
        
         user.register(newUser,req.body.password,function(err, user){
        if(err){
            console.log(err);
            res.render("user_signup");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/user");
            });
        }
 });
});

main.get("/decision/user_login", function(req, res){  //user login route
    res.render("user_login");
});

main.post("/decision/user_login", passport.authenticate("local",  //handle login route
    {
        successRedirect:"/user",
        failureRediect : "/decision/user_login"
}), function(req, res){ 
    });

main.get("/decision/user_logout", function(req, res){
        req.logout();
        res.redirect("/decision");
});

// main.get("/decision/admin_signup", function(req, res){  //admin signup route
//     res.render("admin_signup");
// });


// main.post("/decision/admin_signup", function(req, res){ //to handle admin sign up
//     var newAdmin = new admin({
//         username : req.body.username,
//         type     : "admin"
//     });
        
//      admin.register(newAdmin,req.body.password,function(err, user){
//         if(err){
//             console.log(err);
//             res.redirect("/decision/admin_signup");
//         }else{
//             passport.authenticate("local")(req, res, function(){
//                 res.render("admin");
//             });
//     }
//  });
// });

main.get("/decision/admin_login", function(req, res){ //admin login
    res.render("admin_login");
});

main.post("/decision/admin_login", passport.authenticate("local",  //handle admin login route
    {
        successRedirect:"/admin",
        failureRediect : "/decision/admin_login"
}), function(req, res){ 
    });

main.get("decision/admin_logout", function(req, res){
        req.logout();
        res.redirect("/decision");
});


main.get("/admin", function(req, res){  //admin route
    res.render("admin");
});

main.get("/books_entry", isLoggedin, function(req, res){  //books route
    res.render("books_entry");
});

main.get("/admin/allusers", function(req, res){   // to show all users to admin
    user.find(function(err,allUsers){
        if(err){
            console.log(err);
        }else{
             res.render("admin_allusers",{users:allUsers});
        }
    });
}); 

main.post("/books_entry", function(req, res){ //handles new book entry
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
            res.redirect("/books_entry");
        }else{
            res.render("admin");
        }
    });
});

main.get("/book/edit/:bookid", function(req, res){
    books.findById(req.params.bookid, function(err, foundBook){
        if(err){
            console.log(err);
        }else{
            res.render("edit_book",{book : foundBook});
        }
    });
});

main.put("/book/:bookid", function(req, res){
    books.findByIdAndUpdate(req.params.bookid,req.body.book ,function(err, updatedBook){
        if(err){
            console.log(err);
        }else{
            res.redirect("/admin_books");
        }
    });
});

main.get("/user_books",isLoggedin ,function(req, res){
    books.find({},function(err,allBooks){
        if(err){
            console.log(err);
        }else{
             res.render("user_books",{books:allBooks});
        }
    });
});

main.get("/admin_books",isLoggedin, function(req, res){
    books.find({},function(err,allBooks){
        if(err){
            console.log(err);
        }else{
             res.render("admin_books",{books:allBooks});
        }
    });
});

main.get("/issue/:bookid/:userid",isLoggedin, function(req, res){
    console.log('bbbb',req.params.bookid);
    console.log('vvvvvv',req.params.userid);
    var request = {
        user : req.params.userid,
        book : req.params.bookid
    }
    
    requested_books.create(request , function(err, createdRequest){
        if(err){
            console.log(err);
        }
    });

user.findById(req.params.userid , function(err, foundedUser){
    if(err){
        console.log(err);
    }else{
        foundedUser.requested_books.push(req.params.bookid);
        foundedUser.save();
    }
});

    books.findById(req.params.bookid, function(err, foundBook){
        if(err){
            console.log(err);
        }else{
             foundBook.requestedUser.push(req.params.userid);  // pushes user id in requestedBook array of books schema 
             foundBook.save();   
             console.log('aaaaa',foundBook);
                console.log('rrrrrr',foundBook.requestedUser);
                         res.render("user");
            }
    });

    
});

main.get("/admin/requested_books",isLoggedin, function(req, res){
    books.find(function(err, foundBooks){
        if(err){
            console.log(err);
        }else{
            res.render("requested_books", {allBooks : foundBooks});
        }
    })
});

main.get("/admin/requested_books/:bookid",isLoggedin, function(req, res){

    var username = [];
    books.findById(req.params.bookid, function(err, foundBook){
            if(err){
                console.log(err.message);
            }else{
                    console.log('from book schema ',foundBook.requestedUser);
                    // foundBook.requestedUser.forEach(function(userid){
                        var users = foundBook.requestedUser;
                        user.find({_id: users }, function(err, users){
                            if(err){
                                console.log(err); 
                            }else{
                                // userlist.push(user);
                                
                                users.forEach((i)=>{
                                    username.push(i);
                                })
                                // console.log('from user schema: ',username);
                                // userlist.push(user.username);
                                res.render("book_profile", {book : foundBook, usersarray : username })
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
            // console.log('array',req.params.userid);
            // console.log(foundUser.requested_books.indexOf(req.params.userid));
            // foundUser.requested_books.slice(foundUser.requested_books.indexOf(req.params.userid),1);
            // console.log(foundUser.requested_books);
        }
    });
 });


//  main.get("/admin/deny/:bookid/:userid", function(req, res){
    
//     user.findById(req.params.userid, function(err, foundUser){
//         if(err){
//             console.log(err.message);
//         }else{
//             console.log(foundUser);
//         }
//     });
// });


//middleware
function isLoggedin(req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        console.log("login first");
        res.redirect("decision");
    }
}


//============
//Listen route
//============
main.listen(process.env.PORT , function(req, res){
    console.log("SERVER IS STARTED");
});