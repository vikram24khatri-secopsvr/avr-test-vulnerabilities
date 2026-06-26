
const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const app = express();

// Mock database connection configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'test'
});

// ALERT 1: SQL Injection (CWE-89)
// CodeQL Flag: "Database query built from user-controlled input"
app.get('/user-profile', (req, res) => {
    const userId = req.query.id;
    
    // VULNERABILITY: Directly concatenating untrusted user input into a SQL query
    const sqlQuery = "SELECT * FROM users WHERE id = '" + userId + "'";
    
    connection.query(sqlQuery, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// ALERT 2: Vik K Reflected Cross-Site Scripting / XSS (CWE-79)
// CodeQL Flag: "Reflected cross-site scripting"
app.get('/search', (req, res) => {
    const searchTerm = req.query.q;
    
    // VULNERABILITY: Sending unescaped, raw user input directly back inside HTML response
    res.send(`<h1>Search Results for: ${searchTerm}</h1>`);
});

// ALERT 3: Path Traversal (CWE-22)
// CodeQL Flag: "Arbitrary file write during archive extraction" or "Path traversal"
app.get('/view-file', (req, res) => {
    const filename = req.query.file;
    
    // VULNERABILITY: Constructing a file path using user input without sanitizing '../' sequences
    const securePath = path.join(__dirname, 'public', filename);
    
    fs.readFile(securePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('File not found');
        }
        res.send(data);
    });
});

// ALERT 4: Hardcoded Credentials / Cryptographic Secrets (CWE-798)
// CodeQL/Secret Scanning Flag: "Hardcoded credential"
const AWS_SECRET_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE/fakeSecretKeyDoNotUseInProd"; 

app.listen(3000, () => {
    console.log('Vulnerable test server running on port 3000');
});
