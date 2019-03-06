var createError = require('http-errors');
var express = require('express');
var app = express();
var promise=require('promise');
var path = require('path');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var myConnection = require('express-myconnection');
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }))
app.use(bodyParser.json({ limit: '50mb' }));
var expressValidator = require('express-validator')
app.use(expressValidator());
const { check, validationResult } = require('express-validator/check');
var _ = require('lodash');




app.set('view engine', 'ejs')

var seller = require('./routes/seller');
var user = require('./routes/user');
var orders = require('./routes/orders');
var status = require('./routes/status');



var config = require('./config');


var dbOptions = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  port: config.database.port,
  database: config.database.db
}
app.use(myConnection(mysql, dbOptions, 'pool'));
console.log("db connected");

app.use('/seller', seller);
app.use('/user', user);
app.use('/orders', orders);
app.use('/status', status);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};



//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });




app.listen(3000, function () {
  console.log('Server running at port 3000: http://127.0.0.1:3000')
})