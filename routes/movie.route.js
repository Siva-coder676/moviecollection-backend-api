const express = require('express');
const { MovieIndex, MovieDetails, MovieCreate, MovieUpdate, MovieDelete } = require('../controllers/movie.controllers');


const router = express.Router();

router.get('/', MovieIndex);

router.get('/:id', MovieDetails);

router.post('/', MovieCreate);

router.put('/:id', MovieUpdate);

router.delete('/:id', MovieDelete)


module.exports = router;