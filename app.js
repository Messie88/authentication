//jshint esversion:6
/* dotenv is for environment variables. It has to be at the
top of our app*/
require('dotenv').config(); 
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

/* Encryption Starter. the const secret here has the value
 we we give it */
 
//const secret = "Thisisourlittlesecret";//configured in the .env file

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});
/* without this encryptedFields this will encrypt our entire
 DB. 
 To encrypt more field enryptedFields: ["password", "name"].
 The way mongoose works is that it wil encrypt when you call
 save() and decrypt when you call find() methods*/


// User model
const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home")
});

/////////// Login chained route
app.route("/login")
.get(function (req, res) {
    res.render("login")
})
.post(function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}, function (err, foundUser) {
        if (err) {
            console.log(err)
        } else {
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                    console.log("logged");
                }
            }
        }
    });
});

/////////// Register chained route
app.route("/register")
.get(function (req, res) {
    res.render("register")
})
.post(function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function (err) {
        if (!err) {
            /* We allow the secrets page only once the user
            is registreted or logged*/
            res.render("secrets")
        } else {
            console.log(err);
        }
    });

});


app.listen(3000, function () {
    console.log('The server is connected on port 3001');
});
