const express = require('express-validator');
const router = express.Router();

const bookController = require('../controllers/bookController');
const authorController = require('../controllers/authorController');
const genreController= require('../controllers/genreController');
const bookInstanceController = require('../controllers/bookinstanceController');


router.get('/', bookController.index);
router.get('/book/create', bookController.bookCreateGet);
router.post('/book/create', bookController.bookCreatePost);
router.get('/book/:id/delete', bookController.bookCreateGet);
router.post('/book/:id/delete', bookController.bookCreatePost);
router.get('/book/:id/update', bookController.bookUpdateGet);
router.post('/book/:id/update', bookController.bookUpdatePost);
router.get('/book/:id', bookController.book_detail);
router.get('/books', bookController.book_list);

router.get('/author/create', authorController.author_create_get);
router.post('/author/create', authorController.author_create_post);
router.get('/author/:id/delete', authorController.author_delete_get);
router.post('/author/:id/delete', authorController.author_delete_post);
router.get('/author/:id/update', authorController.author_update_get);
router.post('/author/:id/update', authorController.author_update_post);
router.get('/author/:id', authorController.author_detail);
router.get('/authors', authorController.author_list);

router.get('/genre/create', genreController.genreCreateGet);
router.post('/genre/create', genreController.genreCreatePost);
router.get('/genre/:id/delete', genreController.genreDeleteGet);
router.get('/genre/:id/delete', genreController.genreDeletePost);
router.post('/genre/:id/update', genreController.genreUpdateGet);
router.post('/genre/:id/update', genreController.genreUpdatePost);
router.get('/genre/:id', genreController.genreDetail);
router.get('/genres', genreController.genreList);

router.get('/bookinstance/create', bookInstanceController.bookInstanceCreateGet);
router.post('/bookinstance/create', bookInstanceController.bookInstanceCreatePost);
router.get('/bookinstance/:id/delete', bookInstanceController.bookInstanceDeleteGet);
router.post('/bookinstance/:id/delete', bookInstanceController.bookInstanceDeletePost);
router.get('/bookinstance/:id/update', bookInstanceController.bookInstanceUpdateGet);
router.post('/bookinstance/:id/update', bookInstanceController.bookInstanceUpdatePost);
router.get('/bookinstance/:id', bookInstanceController.bookInstanceDetail);
router.get('/bookinstances', bookInstanceController.bookInstanceList);

module.exports = router;