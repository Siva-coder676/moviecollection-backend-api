
const express = require('express');

const movieRoutes = require('./routes/movie.route');
const connectDB = require('./lib/db');

const app = express();

const PORT = 6969;


app.use(express.json());

app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Movie Apis</title>
        </head>
        <body>
            <h1>Hello</h1>
            <p>Welcome to  my website!</p>
        </body>
        </html>
    `
    res.send(html);
});


app.use('/movies', movieRoutes);


app.listen(PORT, () => {
    console.log(`The server is running at http://localhost:${PORT}`);
});