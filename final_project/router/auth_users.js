const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (user)=>{ //returns boolean
    let filtered_users = users.filter((registeredUser)=> registeredUser.username === user);
    if(filtered_users.length > 0){
        return true;
    }
    return false;
}
const authenticatedUser = (username,password)=>{ //returns boolean
    if(isValid(username)){
        let filtered_users = users.filter((user)=> (user.username===username)&&(user.password===password));
        if(filtered_users.length > 0){
            return true;
        }
        return false;
       
    }
    return false;
    

}

regd_users.post("/register", (req,res) => {
    //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    if(username&&password){
        const present = users.filter((user)=> user.username === username)
        if(present.length===0){
            users.push({"username":req.body.username,"password":req.body.password});
            return res.status(201).json({message:"User Created successfully"})
        }
        else{
          return res.status(400).json({message:"User already exists"})
        }
    }
    else if(!username && !password){
      return res.status(400).json({message:"Bad request"})
    }
    else if(!username || !password){
      return res.status(400).json({message:"Check username and password"})
    }
  
   
  });

//only registered users can login
regd_users.post("/login", (req,res) => {
    let user = req.body.username;
    let pass = req.body.password;
    if(!authenticatedUser(user,pass)){
        return res.status(403).json({message:"User not authenticated"})
    }

    let accessToken = jwt.sign({
        data: user
    },'access',{expiresIn:60*60})
    req.session.authorization = {
        accessToken
    }
    req.session.username = user;
    res.status(200).json({message:"Login successful!"})
 
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  let userd = req.session.username;
  let ISBN = req.params.isbn;
  let details = req.query.review;
  if (!books[ISBN]) {
    return res.status(404).json({message:"Book not found"});
  }
  let rev = {user:userd,review:details}
  books[ISBN].reviews = rev;
  return res.status(201).json({message:"Review added successfully"})
  
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    let ISBN = req.params.isbn;
    if (!books[ISBN]) {
        return res.status(404).json({message:"Book not found"});
    }
    books[ISBN].reviews = {}
    return res.status(200).json({message:"Review deleted successfully"})
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
