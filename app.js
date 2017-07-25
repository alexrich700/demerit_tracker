var express = require("express");
var app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var mongoose = require("mongoose");
var methodOverride = require("method-override");
app.use(methodOverride("_method"));
var passport = require('passport');
var LocalStrategy = require("passport-local");
var session = require("express-session");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");

mongoose.connect("mongodb://localhost/work");

app.use(require("express-session")({
    secret: "Ximena is my gf",
    resave: false,
    saveUninitialized: false
})
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 



var employeeSchema = new mongoose.Schema({
    name: String,
    tallymark: Number,
    strike: Number,
    reasonTally: String,
    reasonStrike: String
});

var Employee = mongoose.model("Employee", employeeSchema);

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.message = req.flash("error");
   res.locals.message = req.flash("success");
   next();
});


app.get("/", function(req, res){
    res.render("index");
});

app.get("/employee", function(req, res){
    Employee.find({}, function(err, foundEmployee){
        if(err){
            console.log(err);
        } else{
            res.render("employee", {employee: foundEmployee});
        }
    });
});

app.get("/employee/new", isLoggedIn, function(req, res) {
    res.render("newemployee");
});

app.post("/employee", function(req, res){
    Employee.create(req.body.employee, function(err, newEmployee){
        if(err){
            res.render("new");
        } else{
            res.redirect("/employee");
        }
    });
});

// EDIT ROUTE Strike
app.get("/employee/:id/strike/edit", isLoggedIn, function(req, res){
    Employee.findById(req.params.id, function(err, foundEmployee){
        res.render("newstrike", {employee: foundEmployee});
    });
});

// EDIT ROUTE Tally
app.get("/employee/:id/tallymark/edit", isLoggedIn, function(req, res){
    Employee.findById(req.params.id, function(err, foundEmployee){
        res.render("newtallymark", {employee: foundEmployee});
    });
});

// UPDATE ROUTE
app.put("/employee/:id", function(req, res){

    Employee.findByIdAndUpdate(req.params.id, req.body.employee, function(err, employee){
        if(err){
            // req.flash("error", err.message);
            console.log(err);
            res.redirect("back");
        } else {
            // req.flash("success","Successfully Updated!");
            res.redirect("/employee");
        }
    });
  });
  
  // show register form
app.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

// SIGN UP LOGIC
app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        } 
        passport.authenticate("local")(req, res, function(){
            res.redirect("/employee");
        });
    });
});

//Logn In Routes
app.get("/login", function(req, res) {
    res.render("login");
});
//Login Logic

app.post("/login", passport.authenticate("local", {
    successRedirect: "/employee",
    failureRedirect: "/login"
}), 
function(req, res){
});

//Logout

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.get("/employee/results", isLoggedIn, function(req, res) {
    Employee.find({}, function(err, foundEmployee){
        if(err){
            console.log(err);
        } else{
            res.render("results", {employee: foundEmployee});
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started");
});