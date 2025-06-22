const Movie = require('../models/movie.model');


const MovieIndex = async (req, res) => {
    try {
        const movie = await Movie.find();
        res.json({
            status: 200,
            movie: movie,
            message: "Get all Movie Details"
        });
    } catch (error) {
        res.json({ message: error.message });
    }

}

const MovieDetails = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (movie == null) {
            return res.status(404).json({ message: "Cannot find a movie" })
        }
        else {
            await res.json({
                status: 200,
                movie: movie,
                message: "Get a Single movie retrieved Sucessfully"
            });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}

const MovieCreate = async (req, res) => {
    console.log(req.body);

    const newMovie = new Movie({
        title: req.body.title,
        description: req.body.description
    })

    try {
        const movie = await newMovie.save();
        return res.status(201).json({
            status: 201,
            movie: movie,
            message: "Movie Added Sucessfully"
        });
    } catch (error) {
        return res.status(400).json({ mesage: error.message });

    }


}

const MovieUpdate = async (req, res) => {
    try {
        const updateMovie = await Movie.findOneAndUpdate({
            _id: req.params.id
        },
            {
                title: req.body.title,
                description: req.body.description
            },
            {
                new: true
            }

        )
        res.status(200).json({
            status: 200,
            movie: updateMovie,
            message: "Movie Updated Sucessfully"
        });

    } catch (error) {
        res.status(400).json({ message: error.message });

    }
}

const MovieDelete = async (req, res) => {
    const movieId = req.params.id;

    try {
        await Movie.deleteOne({ _id: movieId });
        res.json({
            status: 200,
            message: "Movie deleted!"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

module.exports = {
    MovieIndex,
    MovieCreate,
    MovieUpdate,
    MovieDelete,
    MovieDetails
}