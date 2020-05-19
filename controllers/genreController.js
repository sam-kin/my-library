let Genre = require('../models/genre');
let Book = require('../models/book');
let async = require('async');
let validator = require('express-validator');

//display genre list page 
exports.genre_list = function (req, res, next) {

    Genre.find()
    .populate('genre')
    .exec(function (err, genres_list) {
        if (err) {next(err);}

        //success
        res.render('genre', {title: 'Genres List', error: err, genres: genres_list});
    });

}

//display genre create form on get
exports.genre_create_get = function (req, res) {
    res.render('genre_form', {title: 'Create a genre'});
}

//display the detailed information about a genre
exports.genre_detail = function (req, res, next) {

    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id)
            .exec(callback)
        },
        genre_books: function (callback) {
            Book.find({'genre': req.params.id})
            .exec(callback)
        }
    }, function (err, results) {
        if (err) {return next(err);}
        if (results.genre==null) {
            let err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }

        res.render('genre_detail', {title: 'Genre Details', error: err, genre: results.genre, genre_books: results.genre_books});
    })

}

//display genre create form on post
exports.genre_create_post = [

    //Validate the name field is not empy.
    validator.body('name', 'Genre name is required').trim().isLength({min: 1}),

    //Sanitize the (escape) name field
    validator.sanitizeBody('name').escape(),

    //Process a request after validation and sanitization
    (req, res, next) => {

        //Get the error from validator, if they exist
        const errors = validator.validationResult(req);

        //Create a genre object from escaped and trimmed data
        const genre = Genre(
            {name: req.body.name}
        );

        if (!errors.isEmpty()) {
            //There are Errors. Rendre the form page with the user data
            res.render('genre_form', {title: 'Create a genre', errors: errors.array(), genre: genre});
        }
        else {
            //Test if the entered name doesn't exist in the database.
            Genre.findOne({'name': req.body.name})
            .exec(function (err, result) {
                if (err) {return next(err);}

                //On success. i.e. the genre does exist in the database.
                if (result) {
                    res.redirect(result.url);
                }
                else{
                    genre.save(function (err) {
                        if (err) {return next(err);}

                        res.redirect(genre.url);
                    });
                }
            });
        }
    }

]

//display genre upadate form on get
exports.genre_update_get = function (req, res) {
    res.send('CONTENT DOESN\'T EXISTE YET');
}

//display genre update form on post
exports.genre_update_post = function (req, res) {
    res.send('CONTENT DOESN\'T EXISTE YET');
}

//display genre delete form on get
exports.genre_delete_get = function (req, res, next) {
    Genre.findById(req.params.id).exec(function (err, results) {
        if (err) {return next(err);}

        res.render('genre_delete', {title: 'Update Genre', genre: results});
    });
};

//display genre delete form on post
exports.genre_delete_post = function (req, res, next) {

    Book.find({'genre': req.params.id}).exec(function (err, books) {
        if (err) {return next(err);}

        if (books.length > 0) {
            if (books.genre.length > 1) {
                Genre.findByIdAndRemove(req.params.id).exec(function (err) {
                    if (err) {return next(err);}

                    res.render('genre_delete', {title: 'Delete genre', message: 'The genre was successfully deleted'});
                });
            } else {
                console.log(books);
                async.parallel(
                    {
                        book: function (callback) {
                            // Book.findByIdAndRemove(books[0]._id);
                        },
                        genre: function (callback) {
                            Genre.findByIdAndRemove(req.params.id).exec(callback);
                        }
                    },  function (err) {
                        if (err) { return next(err); }
                
                        res.render('genre_delete', {title: 'Delete genre'});
                    }
                );
                            
            } 
        } else {
            Genre.findByIdAndRemove(req.params.id, function (err, result) {
                if (err) {return next(err);}

                res.redirect('/catalog/genre');
            });
        }
    });

   };
