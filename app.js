var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var bcrypt = require('bcrypt');
var randtoken = require('rand-token');
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var dateFormat = require('dateformat');
var format = require('string-format');
var RandExp = require('randexp');
var fileUpload = require('express-fileupload');
var Excel = require("exceljs");
if(typeof require !== 'undefined') XLSX = require('xlsx');
var db = require('./models/model');

require('cf-deployment-tracker-client').track();

app.set('view engine', 'jade');
app.set('views','./views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
// app.use(upload.array());
app.use(cookieParser());
app.use(session({
    secret: "297e6dwdt7dtw7dtta",
    resave: false,
    saveUninitialized: true
}));
app.use(fileUpload());

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('combined'));

app.use(express.static(path.join(__dirname, 'public')));


const saltRounds = 10;

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'chemofinder@gmail.com', // Your email id
        pass: 'chemofinder2016' // Your password
        //TODO remove password use encrypted token SAMEH
    }
});
var options = {
 viewEngine: {
     extname: '.hbs',
     layoutsDir: 'views/email/'
 },
 viewPath: 'views/email/',
 extName: '.hbs'
};
transporter.use('compile', hbs(options));

var languageConfiguration = require('./config/languages/lang.en');
app.use(function(req, res, next) {
    if(req.cookies.lang == 'en') {
        languageConfiguration = require('./config/languages/lang.en');
    }
    else if(req.cookies.lang == 'fr') {
        languageConfiguration = require('./config/languages/lang.fr');
    }
    
    res.locals.lang = languageConfiguration.lang;
    res.locals.base = req.protocol + '://' + req.get('host');
    next();
});

var routes = require('./config/routes')(app);

// setInterval(function () { 
//     console.log('second passed'); 
// }, 1000);

///////////////////////////////////////////////////////////////////////////

app.use('/admin/*', function(err, req, res, next){
console.log(err);
    //User should be authenticated! Redirect him to log in.
    res.redirect('/admin/login');
});

//////////////////////////////////////////////////////////////////////////
http.createServer(app).listen(app.get('port'),
 function(){
  console.log('Express server listening on port ' + app.get('port'));
});
