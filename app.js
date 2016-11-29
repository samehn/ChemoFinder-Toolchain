var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 
var session = require('express-session');
var cookieParser = require('cookie-parser');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var ibmdb = require('ibm_db');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var bcrypt = require('bcrypt');
require('cf-deployment-tracker-client').track();

app.set('view engine', 'jade');

app.set('views','./views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "297e6dwdt7dtw7dtta"}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('combined'));

app.use(express.static(path.join(__dirname, 'public')));
var db2;
var hasConnect = false;

const saltRounds = 10;

var Users = [];

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    if (env['dashDB']) {
        hasConnect = true;
        db2 = env['dashDB'][0].credentials;
    }
    
}

if ( hasConnect == false ) {

   db2 = {
        db: "BLUDB",
        hostname: "dashdb-entry-yp-dal09-10.services.dal.bluemix.net",
        port: 50000,
        username: "dash5082",
        password: "XphM9lInA9M8"
     };
}

var connString = "DRIVER={DB2};DATABASE=" + db2.db + ";UID=" + db2.username + ";PWD=" + db2.password + ";HOSTNAME=" + db2.hostname + ";port=" + db2.port;

// function dbQueryCallBack(query, view, parameters, render) {
    
//   return function(req, res){  

//     ibmdb.open(connString, function(err, conn) {
//         console.log(query);
//             if (err ) {
//              res.send("error occurred " + err.message);
//             }
//             else {
//                 conn.query(query, function(err, tables, moreResultSets) {
                            
//                     // console.log(tables);
//                     // console.log(moreResultSets); 
//                     var data=  {
//                             "data" : tables,
//                             "parameters": parameters
//                         };


//                     console.log(data);                
//                     if ( !err && render) { 
//                         res.render(view, data);

                        
//                     } else {
//                        res.send("error occurred " + err.message);
//                     }

//                     /*
//                         Close the connection to the database
//                         param 1: The callback function to execute on completion of close function.
//                     */
//                     conn.close(function(){
//                         console.log("Connection Closed");
//                         });
//                 });

//             }
//         } );
//     }
// }


function dbQuery(query, callback) {
    var result;
    ibmdb.open(connString, function(err, conn) {
        console.log(query);
            if (err ) {
             return "error occurred " + err.message;
            }
            else {
                conn.query(query, function(err, tables, moreResultSets) {
                    result = tables;        
                    /*
                        Close the connection to the database
                        param 1: The callback function to execute on completion of close function.
                    */
                    console.log(err);
                    console.log(result);
                    conn.close(function(){
                        console.log("Connection Closed");
                        });
                    console.log(result);
                    return callback(result);     
                });

            }
        } );
}

// var parameters ={
//                     "message" : ["ya abdallah"],
//                     "tableName": ["men gawer el sa3eed"]
//                 };
// var query = "SELECT FIRST_NAME, LAST_NAME, EMAIL, WORK_PHONE from GOSALESHR.employee FETCH FIRST 10 ROWS ONLY";           
// var view = 'tablelist';
// app.get('/hamada', dbQueryCallBack(query,view,parameters, true));

app.get('/', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    res.render('home', { base: base });
});

app.get('/admin/dashboard', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    res.render('admin/dashboard', { base: base });
});

// app.get('/lolo', function(req, res){
//     var koko = {};
//     koko['lolo'] = "kiki";
//     res.send(koko);
// });


// app.get('/lolo', function(req, res, next) {
//   var base = req.protocol + '://' + req.get('host');  
//   res.render('index', { base: base });
// });

// Doctors


// app.get('/doctor/signup', function(req, res){
//     res.render('doctor/signup');
// });

function validateWithRegex(regex, email) {
    return regex.test(email);
}

app.post('/doctor/signup', function(req, res){
    var jsonObj = {};
    var valid = true;

    //validate email
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!req.body.email)
    {
        jsonObj['email_error'] = "Email is required";
        valid = false;
    }
    else if(!validateWithRegex(emailRegex, req.body.email))
    {
       jsonObj['email_error'] = "This email is not valid"
       valid = false;
    }
    
    //validate password
    //Minimum 8 characters at least 1 special character
    var passwordRegex = /^(?=.*[A-Za-z\d])(?=.*[$@$!%*#?&\^\\\/"'<>;:+\-()_~{}\[\]=])[A-Za-z\d$@$!%*#?&\^\\\/"'<>;:+\-()_~{}\[\]=]{8,}$/;
    if(!req.body.password)
    {
        jsonObj['password_error'] = "Password is required";
        valid = false;
    }
    else if(!validateWithRegex(passwordRegex, req.body.password))
    {
       jsonObj['password_error'] = "Password has to be minimum 8 characters at least 1 special character";
       valid = false;
    }
    else if(req.body.password != req.body.rpassword)
    {
       jsonObj['password_error'] = "Password and cofirm password doesn't match";   
       valid = false;
    }

    //validate name
    if(!req.body.name)
    {
        jsonObj['name_error'] = "Name is required";
        valid = false;
    }


    var query = "SELECT * from DASH5082.DOCTOR WHERE EMAIL ='" + req.body.email + "';";           
        
    var result = dbQuery(query, function(result) {
        console.log(result);
        if(result.length != 0)
        {
            jsonObj['email_error'] = "This email is already registered"
            valid = false;
            jsonObj['message'] = "failed";
            res.send(jsonObj);
        }
        else
        {
            if(valid)
            {    
                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                    // Store hash in your password DB.
                    // enter new doctor to the db
                    var query = "INSERT INTO DASH5082.DOCTOR (EMAIL, PASSWORD, NAME, APPROVE) VALUES ('" + req.body.email + "','" + hash + "','" + req.body.name + "', '0');";
                    dbQuery(query, function(newResult) {
                        console.log(newResult);
                        jsonObj['message'] = "success";
                        res.send(jsonObj);
                    });
                });
            }
            else
            {
                jsonObj['message'] = "failed";
                res.send(jsonObj);
            }
        }
    });              
});

// app.get('/doctor/login', function(req, res){
//     res.render('doctor/login');
// });

app.post('/doctor/login', function(req, res){
    //console.log(Users);
    //console.log(req.session.user);
    if(!req.body.email || !req.body.password){
        res.send({message: "failed", login_error:"Please enter both email and password"});
    }
    else{
            var query = "SELECT * from DASH5082.DOCTOR WHERE EMAIL ='" + req.body.email + "';";
            var result = dbQuery(query, function(result) {
                //console.log(result[0].ID);

                if(result.length > 0)
                {
                    if(result[0].APPROVE == '0')
                    {
                         res.send({message: "failed", login_error: "Your account is not approved yet"});
                    }
                    else
                    {
                        bcrypt.compare(req.body.password, result[0].PASSWORD, function(err, cmp) {
                            // res == true
                            if(cmp)
                            {
                                req.session.user = result[0];
                                res.send({message: "success"});
                            }
                        });
                    }
                }
                else
                {
                    res.send({message: "failed", login_error: "Invalid Credentials"});
                }
            });
        }    
});


//PHARMACY

// app.get('/pharmacy/signup', function(req, res){
//     res.render('pharmacy/signup');
// });

app.post('/pharmacy/signup', function(req, res){
    var jsonObj = {};
    var valid = true;

    //validate email
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!req.body.email)
    {
        jsonObj['email_error'] = "Email is required";
        valid = false;
    }
    else if(!validateWithRegex(emailRegex, req.body.email))
    {
       jsonObj['email_error'] = "This email is not valid"
       valid = false;
    }
    
    //validate password
    //Minimum 8 characters at least 1 special character
    var passwordRegex = /^(?=.*[A-Za-z\d])(?=.*[$@$!%*#?&\^\\\/"'<>;:+\-()_~{}\[\]=])[A-Za-z\d$@$!%*#?&\^\\\/"'<>;:+\-()_~{}\[\]=]{8,}$/;
    if(!req.body.password)
    {
        jsonObj['password_error'] = "Password is required";
        valid = false;
    }
    else if(!validateWithRegex(passwordRegex, req.body.password))
    {
       jsonObj['password_error'] = "Password has to be minimum 8 characters at least 1 special character";
       valid = false;
    }
    else if(req.body.password != req.body.rpassword)
    {
       jsonObj['password_error'] = "Password and cofirm password doesn't match";   
       valid = false;
    }

    //validate rpassword
    if(!req.body.rpassword)
    {
        jsonObj['rpassword_error'] = "Confirm Password is required";
        valid = false;
    }

    //validate name
    if(!req.body.name)
    {
        jsonObj['name_error'] = "Name is required";
        valid = false;
    }

    //validate address
    if(!req.body.address)
    {
        jsonObj['address_error'] = "Address is required";
        valid = false;
    }

    //validate phone number
    if(!req.body.phone_number)
    {
        jsonObj['phone_number_error'] = "Phone number is required";
        valid = false;
    }

    //validate open from
    if(!req.body.open_from)
    {
        jsonObj['open_from_error'] = "Open from is required";
        valid = false;
    }

    //validate open to
    if(!req.body.open_to)
    {
        jsonObj['open_to_error'] = "Open to is required";
        valid = false;
    }

    var query = "SELECT * from DASH5082.PHARMACY WHERE EMAIL ='" + req.body.email + "';";            
        
    var result = dbQuery(query, function(result) {
        console.log(result);
        if(result.length != 0)
        {
            jsonObj['email_error'] = "This email is already registered"
            valid = false;
            jsonObj['message'] = "failed";
            res.send(jsonObj);
        }
        else
        {
            if(valid)
            {    
                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                  // Store hash in your password DB.
                  // enter new pharmacy to the db
                  var query = "INSERT INTO DASH5082.PHARMACY (EMAIL, PASSWORD, NAME, ADDRESS, PHONE_NUMBER, OPEN_FROM, OPEN_TO, APPROVE) VALUES ('" + req.body.email + "','" + hash + "','" + req.body.name + "', '" + req.body.address + "', '" + req.body.phone_number + "', '" + req.body.open_from + "', '" + req.body.open_to + "', '0');";
                  dbQuery(query, function(newResult) {
                      console.log(newResult);
                      jsonObj['message'] = "success";
                      res.send(jsonObj);
                  });
                });
            }
            else
            {
                jsonObj['message'] = "failed";
                res.send(jsonObj);
            }
        }
    });
});

app.get('/pharmacy/login', function(req, res){
    res.render('pharmacy/login');
});

app.post('/pharmacy/login', function(req, res){
    //console.log(Users);
    //console.log(req.session.user);
    if(!req.body.email || !req.body.password){
        res.send({message: "failed", login_error: "Please enter both email and password"});
    }
    else
    {
        var query = "SELECT * from DASH5082.PHARMACY WHERE EMAIL ='" + req.body.email + "';";
        var result = dbQuery(query, function(result) {
            //console.log(result[0].ID);

            if(result.length > 0)
            {
                if(result[0].APPROVE == '0')
                {
                     res.send({message: "failed", login_error: "Your account is not approved yet"});
                }
                else
                {
                    bcrypt.compare(req.body.password, result[0].PASSWORD, function(err, cmp) {
                        // res == true
                        if(cmp)
                        {
                            req.session.user = result[0];
                            res.send({message: "success"});
                        }
                    });
                }
            }
            else
            {
                res.send({message: "failed", login_error: "Invalid Credentials"});
            }
        });
    }  
});

//ADMIN

app.get('/admin/login', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    res.render('admin/login', { base: base });
});

app.post('/admin/login', function(req, res){
    //console.log(Users);
    //console.log(req.session.user);
    if(!req.body.email || !req.body.password){
        res.send({message: "failed", login_error: "Please enter both email and password"});
    }
    else
    {
        var query = "SELECT * from DASH5082.ADMIN WHERE USERNAME ='" + req.body.email + "';";
        var result = dbQuery(query, function(result) {
            //console.log(result[0].ID);

            if(result.length > 0)
            {
                bcrypt.compare(req.body.password, result[0].PASSWORD, function(err, cmp) {
                    // res == true
                    if(cmp)
                    {
                        req.session.user = result[0];
                        res.send({message: "success"});
                    }
                });
                
            }
            else
            {
                res.send({message: "failed", login_error: "Invalid Credentials"});
            }
        });
    }    
});


app.get('/admin/approve', function(req, res) {
    var query = "SELECT DOCTOR.EMAIL, DOCTOR.NAME,'Doctor' AS TYPE from DASH5082.DOCTOR WHERE DOCTOR.APPROVE = '0' UNION SELECT PHARMACY.EMAIL, PHARMACY.NAME, 'Pharmacy' AS TYPE from DASH5082.PHARMACY WHERE PHARMACY.APPROVE = '0';";
    var result = dbQuery(query, function(result) {
        //console.log(result[0].ID);

        if(result.length == 0)
        {
            // redirect with message
            // res.send({message: "There are no requests currently"});
            res.render('admin/approve', {message: "There are no requests currently"});
        }
        else
        {
            // redirect with data
            // res.send({data: result});
            res.render('admin/approve', {data: result});
        }
    });
});


function checkSignIn(req, res, next){
    if(req.session.user){
        next();     //If session exists, proceed to page
    } else {
        var err = new Error("Not logged in!");
    console.log(req.session.user);
        next(err);  //Error, trying to access unauthorized page!
    }
}

app.get('/protected_page', checkSignIn, function(req, res){
    res.render('protected_page', {name: req.session.user.NAME})
});



app.get('/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/doctor/login');
});

app.use('/protected_page', function(err, req, res, next){
console.log(err);
    //User should be authenticated! Redirect him to log in.
    res.redirect('/login');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
