const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const multer = require("multer");

const app = express();

// --- CONFIGURATION & MIDDLEWARE ---
const CONNECTION_STRING = "mongodb://localhost:27017";
const DATABASENAME = "MyDB";
let database;

app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
    if (!database) {
        return res.status(503).json({ error: "Database not connected yet." });
    }
    next();
});

// --- DATABASE CONNECTION & SERVER START ---
async function start() {
    try {
        const client = new MongoClient(CONNECTION_STRING, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });

        await client.connect();
        database = client.db(DATABASENAME);
        console.log("Connected to MongoDB Cluster");

        app.listen(5038, () => {
            console.log("Server running on http://localhost:5038");
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

start();

// --- ROUTES ---

// 1. Get all books
app.get("/api/books/GetBooks", async (req, res) => {
    try {
        const result = await database.collection("Books").find({}).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books" });
    }
});

// 2. Add a book 
app.post("/api/books/AddBook", multer().none(), async (req, res) => {
    try {
        
        const lastBook = await database.collection("Books").find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastBook.length > 0 ? (parseInt(lastBook[0].id) + 1).toString() : "1";

        await database.collection("Books").insertOne({
            id: newId,
            title: req.body.title,
            description: req.body.description, 
            price: Number(req.body.price) || 0,
            author: req.body.author, // New Field 1
            year: Number(req.body.year) || 0 // New Field 2
        });

        res.json("Added Successfully");
    } catch (error) {
        res.status(500).json({ error: "Failed to add book" });
    }
});

// 3. Update a book
app.put("/api/books/UpdateBook", multer().none(), async (req, res) => {
    try {
        const bookId = req.query.id;
        const updatedData = {
            title: req.body.title,
            description: req.body.description,
            price: Number(req.body.price) || 0,
            author: req.body.author,
            year: Number(req.body.year) || 0
        };

        const result = await database.collection("Books").updateOne(
            { id: bookId },
            { $set: updatedData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json("Book not found");
        }

        res.json("Updated Successfully");
    } catch (error) {
        res.status(500).json({ error: "Failed to update book" });
    }
});

// 4. Delete book
app.delete("/api/books/DeleteBook", async (req, res) => {
    try {
        await database.collection("Books").deleteOne({ id: req.query.id });
        res.json("Deleted successfully!");
    } catch (error) {
        res.status(500).json({ error: "Failed to delete book" });
    }

});
