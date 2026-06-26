const express = require('express');
const app = express();

app.get('/run', (req, res) => {
    // CRITICAL SAST INJECTION: Direct execution of raw user input
    eval(req.query.userInput); 
    res.send('Executed!');
});
