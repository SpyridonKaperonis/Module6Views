const BookInstance = require('../models/bookinstance');
const book = require('../models/book');
const async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.bookinstanceList = function(req, res, next) {

    BookInstance.find().populate('book').exec(function (err, list_bookinstances) {
        if (err) { return next(err); }
        res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list:  list_bookinstances});
      })
  };

exports.bookInstanceDetail = function(req, res, next) {

    BookInstance.findById(req.params.id).populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { 
          const err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      res.render('bookinstance_detail', { title: 'Book:', bookinstance:  bookinstance});
    })
};  

exports.bookInstanceCreateGet = function(req, res, next) {

    book.find({},'title').exec(function (err, books) {
     if (err) { return next(err); }
     res.render('bookinstance_form', {title: 'Create BookInstance', book_list:books } );
   });

};

exports.bookInstanceCreatePost = [

    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').escape(),
    sanitizeBody('due_back').toDate(),
    
    (req, res, next) => {

        const errors = validationResult(req);

        const bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance });
            });
            return;
        }
        else {
            
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   res.redirect(bookinstance.url);
                });
        }
    }
];

exports.bookInstanceDeleteGet = function(req, res, next) {

    BookInstance.findById(req.params.id).populate('book').exec(function (err, bookinstance) {
        if (err) { return next(err); }
        if (bookinstance==null) { 
            res.redirect('/catalog/bookinstances');
        }
        
        res.render('bookinstance_delete', { title: 'Delete BookInstance', bookinstance:  bookinstance});
    })

};

exports.bookInstanceDeletePost = function(req, res, next) {
    
    BookInstance.findByIdAndRemove(req.body.id, function deleteBookInstance(err) {
        if (err) { return next(err); }
        res.redirect('/catalog/bookinstances');
        });

};

exports.bookInstanceUpdateGet = function(req, res, next) {

    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id).populate('book').exec(callback)
        },
        books: function(callback) {
            book.find(callback)
        },

        }, function(err, results) {
            if (err) { return next(err); }
            if (results.bookinstance==null) { 
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            
            res.render('bookinstance_form', { title: 'Update  BookInstance', book_list : results.books, selected_book : results.bookinstance.book._id, bookinstance:results.bookinstance });
        });

};


exports.bookInstanceUpdatePost = [


    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').escape(),
    sanitizeBody('due_back').toDate(),
    
    
    (req, res, next) => {

        const errors = validationResult(req);

        const bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
           });

        if (!errors.isEmpty()) {
            book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    res.render('bookinstance_form', { title: 'Update BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance });
            });
            return;
        }
        else {
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err,thebookinstance) {
                if (err) { return next(err); }
                   res.redirect(thebookinstance.url);
                });
        }
    }
];