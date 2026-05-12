const Axios = require("axios");
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper to convert books object to array if needed
const getBooksArray = () => Object.values(books);

const sendNotFound = (res, message, context = {}) => {
    console.warn(message, context);
    return res.status(404).json({ message });
};

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        const present = users.find((user) => user.username === username);
        if (!present) {
            users.push({ "username": username, "password": password });
            return res.status(201).json({ message: "User Created successfully" });
        } else {
            return res.status(400).json({ message: "User already exists" });
        }
    }
    return res.status(400).json({ message: "Username and password are required" });
});

// Get the book list available in the shop using Promises
public_users.get('/', (req, res) => {
    const getBooks = new Promise((resolve) => {
        setTimeout(() => resolve(books), 500);
    });

    getBooks.then((booksList) => {
        res.json(booksList);
    }).catch((err) => {
        console.error("Unable to retrieve books", err);
        res.status(500).json({ message: "Unable to retrieve books" });
    });
});

// Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', (req, res) => {
    const ISBN = req.params.isbn;
    
    const booksBasedOnIsbn = (isbn) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // If books is an object, access by key. If it's an array, use find.
                const book = books[isbn]; 
                if (book) {
                    resolve(book);
                } else {
                    reject("Book not found");
                }
            }, 500);
        });
    };

    booksBasedOnIsbn(ISBN)
        .then((book) => res.json(book))
        .catch((err) => sendNotFound(res, err, { isbn: ISBN }));
});

// Get book details based on author using Promises
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;

    const booksBasedOnAuthor = (auth) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Convert object to array to filter by property
                const filteredBooks = Object.values(books).filter((b) => b.author === auth);
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject("No books found for this author");
                }
            }, 500);
        });
    };

    booksBasedOnAuthor(author)
        .then((books) => res.json(books))
        .catch((err) => sendNotFound(res, err, { author }));
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;

    const booksBasedOnTitle = (bookTitle) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const filteredBooks = Object.values(books).filter((b) => b.title === bookTitle);
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject("No books found with this title");
                }
            }, 500);
        });
    };

    booksBasedOnTitle(title)
        .then((books) => res.json(books))
        .catch((err) => sendNotFound(res, err, { title }));
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        res.json(book.reviews || {});
    } else {
        sendNotFound(res, "Book not found", { isbn });
    }
});

module.exports.general = public_users;
