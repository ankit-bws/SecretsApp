//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const { prototype } = require('events');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(express.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error: '));
db.once('open', function(){
    console.log('Connection to database has been established');
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

app.get("/", function(req, res){
    res.render("home", {});
});

app.get("/register", function(req, res){
    res.render("register", {});
});

app.get("/login", function(req, res){
    res.render("login", {});
})

app.post("/register", function(req, res){
    bcrypt.hash(req.body.username, saltRounds, function(err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash,
        });
        newUser.save(function(err){
            if(!err){
                console.log("New user has registered");
                res.render("secrets", {});
            }
            else{
                console.log(err);
            }
        });
    });
});

app.post("/login", function(req, res){
    const username = req.body.username; 
    const password = req.body.password;
    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                console.log("Found user!");
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if(result===true){
                        console.log("Login password match!");
                        res.render("secrets", {});
                    }
                });
            }
        }
    });
});

const PORT = 3000 || process.env.port;
app.listen(PORT, function(req, res){
    console.log("Server started successfully!");
});