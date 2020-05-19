let Author = require('../models/author');
let Books = require('../models/book');
let async = require('async');
let {body, validationResult} = require('express-validator/check');
let {sanitizeBody} = require('express-validator/filter');
let moment = require('moment');

//display the author items
exports.author_list = function (req, res, next) {
    
    Author.find()
    .populate('author')
    .sort([['last_name', 'ascending']])
    .exec(function (err, author) {
        if (err) {next(err);}

        //success
        res.render('author', {title: 'Author List', error: err, authors: author});
    });

}

//display author details
exports.author_details = function (req, res, next) {
    
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id)
            .exec(callback);
        },

        author_books: function (callback) {
            Books.find({'author': req.params.id})
            .exec(callback)
        }
    }, function (err, results) {
        if (err) {return next(err);}
        if (results.author == null) {
            let err = new Error('Author not found');
            err.status = 404;
            return err;
        }

        res.render('author_detail', {title: 'Author details', error: err, author: results.author, author_books: results.author_books});
    });

};

//display author create form on get
exports.author_create_get = function (req, res) {
    res.render('author_form', {title: 'Create Author'});
};

//display author create post 
exports.author_create_post = [

    //validate fields
    body('first_name').isLength({min: 1}).trim().withMessage('Author first name is required')
    .isAlphanumeric().withMessage('First name has none numeric caracter'),
    body('last_name').isLength({min: 1}).trim().withMessage('Author Last name is required')
    .isAlphanumeric().withMessage('Last name has none numeric caracter'),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true}).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({checkFalsy: true}).isISO8601(),

    //Sanitize fields
    sanitizeBody('first_name').escape(),
    sanitizeBody('last_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    //Process a request after validation and sanitization
    (req, res, next) => {

        //Extract Error from validator
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('author_form', {title: 'Create an author', errors: errors.array(), author: req.body});
        } else {
           const author = new Author({
               first_name: req.body.first_name,
               last_name: req.body.last_name,
               date_of_birth: req.body.date_of_birth,
               date_of_death: req.body.date_of_death
           });

           Author.findOne({'name': author.name})
           .exec(function (err, result) {
               if (err) {return next(err);}

               if (result) {
                   res.redirect(results.url);
               } else {
                   author.save(function (err) {
                       if (err) {return next(err);}

                       res.redirect(author.url);
                   });
               }
           });

        }
    }

];

//display author update form on get
exports.author_update_get = function (req, res, next) {
    Author.findById(req.params.id)
    .exec(function (err, results) {
        if (err) {return next(err);}
        let myAuthor = new Author({
            first_name: results.first_name,
            last_name: results.last_name,
            date_of_birth: results.date_of_birth_reformated,
            date_of_death: moment(results.date_of_death).format('YYY-MMM-Do')
        });
        // console.log(myAuthor.date_of_birth_reformated);
        let dOB = moment(results.date_of_birth).format('YYYY-MM-DD');
        console.log(dOB);
        res.render('author_form', {title: 'Update author', author: myAuthor, dat_of_birth: dOB});
    });
};

//display author update form on post
exports.author_update_post = [
    //validators
    body('first_name', 'Author first name is required').trim().isLength({min: 1}),

    (req, res, next) => {

        const myAuthor = new Author({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            date_of_birth: req.body.date_of_birth,
            _id: req.params.id
        });

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('author_form', {title: myAuthor.name, author: myAuthor, errors: errors});
        } else {
            Author.findByIdAndUpdate(req.params.id, myAuthor, {}, function (err, theAuthor) {
                if (err) {return next(err);}
                
                res.redirect(theAuthor.url);
            });
        }
    }
];

//display author delete form on get 
exports.author_delete_get = function (req, res, next) {
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id).exec(callback);
        },
        author_books: function (callback) {
            Books.find({'author': req.params.id}).exec(callback);
        }
            
    }, function (err, results) {
        if (err) {return next(err);}

        res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.author_books});
    }
    );
    
}; 

//display author delete form on post
exports.author_delete_post = [
    (req, res, next) => {
       
        async.parallel({

            author: function (callback) {
                Author.findById(req.params.id).exec(callback);
            },
            author_books: function (callback) {
                Books.find({'author': req.params.id}).exec(callback);
            }

        }, function (err, results) {
            if (err) {return next(err);}

            if (results.author_books.length > 0) {
                res.render('author_delete', {title: 'Delete Author', author:results.author, author_books: results.author_books, exist:true});                
            } else {
                Author.findByIdAndRemove(req.params.id, function (err) {
                    if (err) {return next(err);}
        
                    res.redirect('/catalog/author');
                });        
            }

        });
    
       
    }

];

exports.author_books_delete_post = function () {

};
