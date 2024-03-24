const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

const {v4:uuidv4} = require('uuid');
const port =process.env.PORT ||  3000

const db = mongoose.connect(process.env.DB_URI)
db.then(()=>{
    console.log("Database connected");
})
.catch(()=>{
    console.log("Error in connectig to database");
})


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs");

app.use("/static",express.static(path.join(__dirname,'public')));
app.use('/temp',express.static('temp'))
app.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:true
  }));
  app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
  })
// passport

  app.use(passport.initialize());
  app.use(passport.session());

  
  app.use('/',require('./routes/adminRoutes'))
  app.use('/',require('./routes/userRoutes'))
  


  app.listen(port,()=>{
    console.log("Listening to server http://localhost:3000");
  })