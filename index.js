/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const app = express();
const port = 8000;
const cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require('jsonwebtoken');
const passwordEncode = encodeURIComponent('Blackdiamond@1');

mongoose
  .connect(
    `mongodb+srv://deepakoram:${passwordEncode}@cluster0.xzffmlk.mongodb.net/`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => {
    console.log('connected to mongo db');
  })
  .catch(err => {
    console.log('error - ', err);
  });

app.listen(port, () => {
  console.log('server running on port 8000');
});

const User = require('./models/user');
const Message = require('./models/message');

// endpoint for registering the user

app.post('/register', (req, res) => {
  const {name, email, password, image} = req.body;

  // create a new user object
  const newUser = new User({name, email, password, image});

  // save the user to the database
  newUser
    .save()
    .then(() => {
      res.status(200).json({message: 'User registered successfully'});
    })
    .catch(err => {
      console.log('Error registering user', err);
      res.status(500).json({message: 'Error registering the user'});
    });
});
// function to create token
const createToken = (userId) =>{
  // set the token payload
  const payload = {
    userId: userId,
  };

  // Generate the token with a secret key and expiration time
  const token = jwt.sign(payload,'deepakkey',{expiresIn: '1hr'});
  return token;
};


// endpoint to login

app.post('/login', (req, res) => {
  const {email, password} = req.body;

  // check if the email and password are provided
  if (!email || !password) {
    return res.status(404).json({message: 'Email and password are required'});
  }

  // check for that user
  User.findOne({email})
    .then(user => {
      if (!user) {
        return res.status(404).json({message: 'User not found'});
      }

      // compare the password provided with db password
      if (user.password !== password) {
        return res.status(404).json({message: 'Invalid password'});
      }
      const token = createToken(user._id);
      res.status(200).json({token});
    })
    .catch(error => {
      console.log('error in finding the user', error);
      res.status(500).json({message: 'Internal server error'});
    });
});
