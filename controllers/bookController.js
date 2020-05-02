const book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require('async');

exports.index = function(req,res){
    async.parallel({
        bookCount: function(callback){
            book.count(callback);
        },
        bookInstanceCount: function(callback){
            BookInstance.count(callback);
        },
        bookInstanceAvailableCount: function(callback){
            BookInstance.count({status: 'Available'},callback);
        },
        authorCount: function(callback){
            Author.count(callback);
        },
        genreCount: function(callback){
            Genre.count(callback);
        },
    },
    function(err, results){
        res.render('index', {title: 'Local Library Home', error: err, data: results});
    });
};

  exports.book_list = function(req, res, next){
      book.find({}, 'title author').populate('author').exec(function(err, listBooks){
          if(err){return next(err)}
          else{
              res.render('book_list',{title: 'Book List', book_list: list_books});
          }
      });
  };


exports.book_detail = function(req, res, next)  {
    async.parallel({
        book: function(callback){
            book.findById(req.params.id).populate('author').populate('genre')
            .exec(callback);
        },
    },
    function(err, results){
        if(err){return next(err);}
        if(results.book==null){
            const err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        res.render('book_detail', {title: 'Title', book: results.book, BookInstance: results.bookInstance});
    
    });
};

exports.bookCreateGet = function(req, res, next){
    async.parallel({
        authors: function(callback){
            Author.find(callback);
        },
        genres: function(callback){
            Genre.find(callback);
        },
    },
    function(err, results){
        if(err){return next(err);}
        res.render('book_form', {title: 'Create Book', authors: results.authors, genres: results.genres});
    
    });
};

exports.bookCreatePost = [
    (req, res, next)=>{
    if(!(req.body.Genre instanceof Array)){
        if(typeof req.body.Genre==='undefined'){
            req.body.Genre=[];
            elsereq.body.Genre = new Array(req.body.Genre);
        }
        next();
    }
    },
    body('title', 'Title must not be empty.').isLength({min: 1}).trim(),
    body('author', 'Author must not be empty.').isLength({min: 1}).trim(),
    body('summary', 'Summary must not be empty').isLength({min: 1}).trim(),
    body('isbn', "ISBN must not be empty.").isLength({min:1}).trim(),
    sanitizeBody('*').escape(),
    sanitizeBody('genre.*').escape(),
    (req, res, next)=>{
        const errors = validationResult(req);

        const book = new BookInstance({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });
        if(!errors.isEmpty()){
            async.parallel({
                authors: function(callback){
                    Author.find(callback);
                },
                genres: function(callback){
                    Genre.find(callback);
                },
            },
            function(err, results){
                if(err){return next(err);}

                for(let i=0; i<results.genre.length; i++){
                    if(book.genre.indexOf(results.genres[i]._id)>-1){
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', {title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array()});
            });
            return;
        }
        else{
            book.save(function(err){
                if(err){return next(err);}
                res.redirect(book.url);
            });
        }

    },
];
exports.bookDeleteGet = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        book_bookinstances: function(callback) {
            BookInstance.find({ 'book': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { 
            res.redirect('/catalog/books');
        }
       
        res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_bookinstances } );
    });

};

exports.bookDeletePost = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            book.findById(req.body.id).populate('author').populate('genre').exec(callback);
        },
        bookBookinstances: function(callback) {
            BookInstance.find({ 'book': req.body.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        
        if (results.book_bookinstances.length > 0) {
            
            res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_bookinstances } );
            return;
        }
        else {
            book.findByIdAndRemove(req.body.id, function deleteBook(err) {
                if (err) { return next(err); }
                
                res.redirect('/catalog/books');
            });

        }
    });

};

exports.bookUpdateGet = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.book==null) { 
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var book_g_iter = 0; book_g_iter < results.book.Genre.length; book_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()==results.book.Genre[book_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            res.render('book_form', { title: 'Update Book', authors:results.authors, genres:results.genres, book: results.book });
        });

};

exports.bookUpdatePost = [

    (req, res, next) => {
        if(!(req.body.Genre instanceof Array)){
            if(typeof req.body.Genre==='undefined')
            req.body.Genre=[];
            else
            req.body.Genre=new Array(req.body.genre);
        }
        next();
    },
   
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    sanitizeBody('title').escape(),
    sanitizeBody('author').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('isbn').escape(),
    sanitizeBody('genre.*').escape(),

    (req, res, next) => {

        const errors = validationResult(req);

        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.Genre==='undefined') ? [] : req.body.Genre,
            _id:req.params.id 
           });

        if (!errors.isEmpty()) {
            
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                for (let i = 0; i < results.genres.length; i++) {
                    if (book.Genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                   res.redirect(thebook.url);
                });
        }
    }
];
