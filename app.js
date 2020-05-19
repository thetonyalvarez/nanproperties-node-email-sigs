var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var agentsRouter = require('./routes/agents');
var developmentsRouter = require('./routes/developments');
var affiliatesRouter = require('./routes/affiliates')
var globalPropertiesRouter = require('./routes/global-properties')
var propertybasePDFsRouter = require('./routes/propertybase-pdfs')

var app = express();



var { Liquid }  = require('liquidjs');
var engine      = new Liquid({
    root: path.join(__dirname, 'views/pdfs/')
});



// Use two engines with consolidate.js
var engines = require('consolidate');
app.engine('liquid', engines.liquid);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/agents', agentsRouter);
app.use('/our-developments-page', developmentsRouter);
app.use('/affiliates', affiliatesRouter);
app.use('/global-properties', globalPropertiesRouter);
app.use('/pdfs', propertybasePDFsRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;




























/*

var port = 3000

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

app.get('/', function (req, res) {
    res.render('index', { title: 'Hey', message: 'Hello there!' })
})

app.use(express.static('public'))
*/