var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// var multer = require('multer');
// var upload = multer(); 
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
app.use(session({secret: "297e6dwdt7dtw7dtta"}));
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

// app.get('/admin/dashboard', checkAdminSignIn, function(req, res){
//     var base = req.protocol + '://' + req.get('host');
//     res.render('admin/dashboard', { base: base });
// });

app.get('/generaterandompassword', function(req, res) {
    var random = new RandExp(/(?=.*[A-Za-z\d])@[A-Za-z\d]{8,10}/).gen();
    res.send({random: random});
});

app.get('/doctor/getapprovedmedicines', function(req, res){
    var query = "SELECT * from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
    db.dbQuery(query, function(result) {
        res.send({medicines: result});    
    });
});

app.get('/getmedicinebyid/:id', function(req, res){
    var query = "SELECT * from DASH5082.MEDICINE WHERE ID =" + req.params.id;
    db.dbQuery(query, function(result) {
        res.send({medicine: result});    
    });
});

app.post('/getmedicineid', function(req, res) {
    var query = "SELECT ID from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + req.body.generic_name + "' AND BRAND_NAME = '" + req.body.brand_name + "' AND FORM = '" + req.body.form + "' AND STRENGTH = '" + req.body.strength + "' AND STRENGTH_UNIT = '" + req.body.strength_unit + "' AND MANUFACTURER = '" + req.body.manufacturer + "';";
    db.dbQuery(query, function(result) {
        if(result.length != 0)
        {
            res.send({message:"success", medicine_id: result[0].ID});
        }
        else
        {
            res.send({message:"failed"});
        }
    });
});


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
