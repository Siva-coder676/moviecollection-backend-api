require('dotenv').config(); 

const express = require('express');

const movieRoutes = require('./routes/movie.route');

const authRoutes = require('./routes/auth.route')
const connectDB = require('./lib/db');

const helmet = require('helmet');

const cors = require('cors');

const cookieParser = require('cookie-parser');

const app = express();

const PORT = process.env.PORT || 6969; // Also consider using environment variable for PORT


app.use(express.json());

app.use(cors());

app.use(helmet());

app.use(cookieParser());

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

app.use('/user', authRoutes);


app.listen(PORT, () => {
    console.log(`The server is running at http://localhost:${PORT}`);
});