let Bookinstance = require('../models/bookinstance');
let Book = require('../models/book');
let {body, validationResult} = require('express-validator/check');
let {sanitizeBody} = require('express-validator/filter');


let async = require('async');
let moment = require('moment');

//diplay bookinstance list page 
exports.bookinstance_list = function (req, res, next) {

    Bookinstance.find()
    .populate('book')
    .sort([['book', 'ascending']])
    .exec(function (err, bookinstances) {
        if (err) {next(err);}

        //success
        res.render('bookinstance', {title: 'Bookinstance List', data: bookinstances});
    });
    
};

//display bookinstance update form on get 
exports.bookinstance_update_get = function (req, res, next) {
    async.parallel(
        {
            books: function(callback) {
                Book.find().exec(callback);
            },
            bookinstance: function (callback) {
                Bookinstance.findById(req.params.id).exec(callback);
            }
        }, function (err, results) {
            if (err) {return next(err);}

            let dB = moment(results.bookinstance.due_back).format('YYYY-MM-DD');
            res.render('bookinstance_form', {title: 'Update bookinstance', books: results.books, bookinstance: results.bookinstance, due_back: dB});
        }
    );
};

//display bookinstance update form on post
exports.bookinstance_update_post = [
    //valitors
    body('book', 'The book is required').trim().isLength({min: 1}),
    body('imprint', 'The imprint is required').trim().isLength({min: 1}),
    body('status', 'The status is required').trim().isLength({min: 1}),
    body('due_back', 'The due date is required').trim().isLength({trim: 1}),

    //sanitizers
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').escape(),
    sanitizeBody('due_back').escape(),

    (req, res, next) => {
        let errors = validationResult(req);

        let bookinstance = new Bookinstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            Book.find().exec(function (err, books) {
                if (err) {return next(err);}

                res.render('bookinstance_form', {title: 'Update Bookinstance', bookinstance: bookinstance, books: books, errors: errors.array()});
            });
        } else {
            Bookinstance.findByIdAndUpdate(req.params.id, bookinstance, function (err, results) {
                if (err) {return next(err);}

                res.redirect(results.url);
            });
        }
    }  

];

//display single bookinstance information
exports.bookinstance_detail = function (req, res, next) {
    Bookinstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, result) {
        if (err) {return next(err);}
        if (result == null) {
            let err = new Error('Bookinstance not found');
            err.status = 404;
            return err;
        }
        res.render('bookinstance_detail', {title: 'Bookinstance Details', error: err, data: result});
    
        console.log(result.bookinstance);
    });
};

//display bookinstance delete on post
exports.bookinstance_delete_post = function (req, res, next) {
    Bookinstance.findByIdAndRemove(req.params.id, function (err, results) {
        if (err) {return next(err);}

        res.redirect('/catalog/bookinstance');
    });
};

//display bookinstance delete form on get
exports.bookinstance_delete_get = function (req, res, next) {
    Bookinstance.findById(req.params.id).exec(function (err, results) {
        if (err) {return next(err);}

        res.render('bookinstance_delete', {title: 'Delete bookinstance', errors: err, bookinstance: results});
    });
};

//display bookinstance create form on get 
exports.bookinstance_create_get = function (req, res) {

    Book.find()
    .exec(function (err, results, next) {
        if (err) {return next(err);}

        res.render('bookinstance_form', {title: 'Create a Book instance', books: results});
    });
};

//display bookinstance create form on post
exports.bookinstance_create_post = [

    //validate fields
    body('book').trim().isLength({min: 1}).withMessage('Name of the Book is required'),
    body('imprint', 'Book instance Imprint is required').trim().isLength({min: 1}),
    body('due_back', 'Invalid due-back date').optional({checkFalsy: true}).isISO8601(),

    //sanitize fields
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    //Send a request after validation and sanitization
    (req, res, next) => {

        //extract the error from validator
        let errors = validationResult(req);

        //create a bookinstance object
        let bookinstance = new Bookinstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            Book.find()
            .exec(function (err, results, next) {
                if (err) {return next(err);}
                res.render('bookinstance_form', {title: 'Create a Book instance', books: results, bookinstance: bookinstance, errors: errors.array()});
            });
        } else {
            bookinstance.save(function (err) {
                if (err) {return next(err);}

                res.redirect(bookinstance.url);
            });
        }
    }
];