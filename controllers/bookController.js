let Book = require('../models/book');
let Bookinstance = require('../models/bookinstance');
let Author = require('../models/author');
let Genre = require('../models/genre');

let {body, validationResult} = require('express-validator/check');
let {sanitizeBody} = require('express-validator/filter');

let async = require('async');

//display the index page 
exports.index = function (req, res) {

    async.parallel({
        book_count: function (callback) {
            Book.countDocuments({}, callback);
        },
        bookinstance_count: function (callback) {
            Bookinstance.countDocuments({}, callback);
        },
        bookinstance_available_count: function (callback) {
            Bookinstance.countDocuments({status: 'Available'}, callback);
        },
        author_count: function (callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function (callback) {
            Genre.countDocuments({}, callback);
        },
    }, function (err, results) {
        res.render('index', {title: 'Local library Home Page', error: err, data: results});
    });
};

//display book lisp page
exports.book_list = function (req, res, next) {
    
    Book.find({}, 'title author')
    .populate('author')
    .exec((err, list_books) => {
        if (err) { return next(err); }
        //success
        res.render('book_list', {title: 'Book List', books_list: list_books});
    });

};

//display book create form on get
exports.book_create_get = function (req, res) {

    async.parallel({

        genres: function (callback) {
            Genre.find(callback);
        },

        authors: function (callback) {
            Author.find(callback);
        }
    }, 
        function (err, results) {
            if (err) {return next(err);}

            res.render('book_form', {title: 'Create a book', errors: err, genres: results.genres, authors: results.authors});
        }
    
    );

};

//display book create form on post
exports.book_create_post = [

    //Convert the genres into a array
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === undefined) {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next();
    },
    
    //validate fields
    body('title').isLength({min: 1}).trim().withMessage('Book title is requred'),
    body('author').isLength({min: 1}).trim().withMessage('The has to be specified.'),
    body('summary').isLength({min: 1}).trim().withMessage('Book\'s summary is required'),
    body('isbn').trim().isLength({min: 5}).withMessage('Book\'s isBn is required')
    .isAlphanumeric().withMessage('Isbn must be alphanumeric'),

    //Sanitize fields
    sanitizeBody('title').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('genre*').escape(),
    sanitizeBody('isbn').escape(),

    //Send a request after the validation and sanitization 
    (req, res, next) => {

        const errors = validationResult(req);
        console.log(req.body.genre);
       //Create a Book
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            genre: req.body.genre,
            summary: req.body.summary,
            isbn: req.body.isbn
        });

        if (!errors.isEmpty()) {

            //get all genres and authors
            async.parallel({

                genres: function (callback) {
                    Genre.find(callback);
                },

                authors: function (callback) {
                    Author.find(callback);
                }
            }, 

                function (err, results, next) {
                    if (err) {return next(err);}

                    for (let i = 0; i < results.genres.length; i++) {
                        if (book.genre.indexOf(results.genres[i]._id) > -1) {
                            results.genres[i].checked = 'true';
                        }
                    }

                    res.render('book_form', {title: 'Create a Book', errors: errors.array(), book: book, genres: results.genres, authors: results.authors});
                }

            );
        } else {
            book.save(function (err) {

                if (err) {return next(err);}
    
                res.redirect(book.url);
            });
        }

    }

];

//display a book's detailed information
exports.book_detail = function (req, res, next) {
    let id = req.params.id;
    async.parallel({
        book: function(callback) {
            Book.findById(id)
            .populate('author genre')
            .exec(callback);
        },
        book_copies: function (callback) {
            Bookinstance.find({'book': id})
            .sort([['status', 'ascending']])
            .populate('book')
            .exec(callback);
        }
        
    }, function (err, results) {
        if (err) {return next(err);}
        if (results.book==null) {
            let err = new Error('Book is not found');
            err.status = 404;
            return next(err);
        }

        res.render('book_detail', {title: 'Book Details', error: err, book: results.book, book_copies: results.book_copies});
    });

}

//display book update form on get 
exports.book_update_get = function (req, res) {
    async.parallel(
        {
            book: function (callback) {
                Book.findById(req.params.id).exec(callback);
            },
            author: function (callback) {
                Author.find().exec(callback);
            },
            genre: function (callback) {
                Genre.find().exec(callback);
            }
        }, function (err, results) {
            if (err) {return next(err);}

            if (!results.book) {
                res.redirect('/catalog/book');
            }

            for (let i = 0; i < results.genre.length; i++) {
                if (results.book.genre.indexOf(results.genre[i]._id) > -1) {
                    results.genre[i].checked = true;
                }
            }

            res.render('book_form', {title: 'Update Book', book: results.book, genres: results.genre, authors: results.author});
        }
    );
};

//display book update forom on post
exports.book_update_post = [
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre==='undefined') {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next();
    },
    //validators
    body('title', 'Book title is required').trim().isLength({min: 1}), 
    body('author', 'Author name is required').trim().isLength({min: 1}),
    body('isbn', 'Book\'s isbn is required').trim().isLength({min: 1}),
    body('summary', 'Book\'s summary is required').trim().isLength({min: 1}),
    
    //sanitizers
    sanitizeBody('title').escape(),
    sanitizeBody('genre*').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('isbn').escape(),

    (req, res, next) => {
        let errors = validationResult(req);

        let book = new Book({
            tilte: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre,
            _id: req.params.id
        });
        // next()

        if (!errors.isEmpty()) {
            async.parallel(
                {
                    author: function (callback) {
                        Author.find().exec(callback);
                    },
                    genre: function (callback) {
                        Genre.find().exec(callback);
                    }
                }, function (err, results) {
                    if (err) {return next(err);}
                    res.render('book_form', {title: 'Update Book', errors: errors, book: book, authors: results.author, genres: results.genre});                    
                }
            );
        } else {
            Book.findByIdAndUpdate(req.params.id, book, function (err, results) {
                if (err) {return next(err);}
                
                res.redirect(results.url);
            });
        }
    }
];

//display book delete form on get
exports.book_delete_get = function (req, res, next) {
    async.parallel(
        {
            book: function (callback) {
                Book.findById(req.params.id).exec(callback);
            },
            bookinstances: function (callback) {
                Bookinstance.find({'author': req.params.id}).exec(callback);
            }
        }, function (err, results) {
            if (err) {return next(err);}

            if (results.book) {
                res.render('book_delete', {title: 'Delete book', book: results.book, bookinstances: results.bookinstances});
            } else {
                redirect('/catalog/book');
            }
        }
    );
};

//display book delete form on post
exports.book_delete_post = function (req, res, next) {
    Bookinstance.find({'book': req.params.id}).exec(function (err, bookinstances) {
        if (err) {return next(err);}

        if (bookinstances.length > 0) {
            
            for (let i = 0; i < bookinstances.length; i++) {
                console.log(bookinstances[i]._id);
                Bookinstance.findByIdAndRemove(bookinstances[i]._id, function (err) {
                    if (err) {return err;}
                });
            }
        } else {
            console.log('No bookinstance');
        }

        Book.findByIdAndRemove(req.params.id, function (err, result) {
            if (err) {return next(err);}
            res.render('book_delete', {title: 'Delete Book'});
        });
    });
};