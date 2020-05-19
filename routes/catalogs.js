let express = require('express');
let router = express.Router();

//Require controllers
let book_controller = require('../controllers/bookController');
let author_controller = require('../controllers/authorController');
let bookinstance_controller = require('../controllers/bookinstanceController');
let genre_controller = require('../controllers/genreController');


//BOOK ROUTES

//GET catalog home page 
router.get('/', book_controller.index);


//GET request for creating a book
router.get('/book/create', book_controller.book_create_get);

//POST request for creating a book
router.post('/book/create', book_controller.book_create_post);

//GET request for getting book list
router.get('/book', book_controller.book_list);

//GET request for getting a single book details
router.get('/book/:id', book_controller.book_detail);

//GET request for updating a book item 
router.get('/book/:id/update', book_controller.book_update_get);

//POST request for updating a book item
router.post('/book/:id/update', book_controller.book_update_post);

//GET request for deleting a book item 
router.get('/book/:id/delete', book_controller.book_delete_get);

//POST request for deleting a book item 
router.post('/book/:id/delete', book_controller.book_delete_post);

//AUTHOR ROUTES

//GET request for creating an author
router.get('/author/create', author_controller.author_create_get);

//POST request for creating an author
router.post('/author/create', author_controller.author_create_post);

//GET request for getting the list of authors
router.get('/author', author_controller.author_list);

//GET request for getting the sigle author page
router.get('/author/:id', author_controller.author_details);

//GET request for deleting an author 
router.get('/author/:id/delete', author_controller.author_delete_get);

//POST request for deleting an author
router.post('/author/:id/delete', author_controller.author_delete_post);

//GET request for updating an author
router.get('/author/:id/update', author_controller.author_update_get);

//POST request for updating an author 
router.post('/author/:id/update', author_controller.author_update_post);

//GENRE ROUTES

//GET request for creating a genre
router.get('/genre/create', genre_controller.genre_create_get);

//POST request for creating a genre 
router.post('/genre/create', genre_controller.genre_create_post);

//GET request for getting the list of all the genres
router.get('/genre', genre_controller.genre_list);

//GET request for getting a genre details
router.get('/genre/:id', genre_controller.genre_detail);

//GET request for deleting a genre 
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

//POST request for deleting a genre 
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

//GET request for updating a genre
router.get('/genre/:id/update', genre_controller.genre_update_get);

//POST request for updating a genre 
router.post('/genre/:id/update', genre_controller.genre_update_post);

//BOOKINSTANCE ROUTES

//GET request for creating a bookinstance
router.get('/bookinstance/create', bookinstance_controller.bookinstance_create_get);

//POST request for creating a bookinstance
router.post('/bookinstance/create', bookinstance_controller.bookinstance_create_post);

//GET request for getting the list of all bookindtances
router.get('/bookinstance', bookinstance_controller.bookinstance_list);


//GET request for getting a single bookinstance deisplay page
router.get('/bookinstance/:id', bookinstance_controller.bookinstance_detail);

//GET request for deleting a bookinstance 
router.get('/bookinstance/:id/delete', bookinstance_controller.bookinstance_delete_get);

//POST request for deleting a bookinstance
router.post('/bookinstance/:id/delete', bookinstance_controller.bookinstance_delete_post);

//GET request for updating a bookinstance 
router.get('/bookinstance/:id/update', bookinstance_controller.bookinstance_update_get);

//POST request for updating a bookinstance 
router.post('/bookinstance/:id/update', bookinstance_controller.bookinstance_update_post);

module.exports = router;