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
var randtoken = require('rand-token');
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var dateFormat = require('dateformat');
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


require('./routes/home')(app);



app.get('/admin/dashboard', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    res.render('admin/dashboard', { base: base });
});


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


app.get('/admin/manage_users', function(req, res) {
    var query = "SELECT DOCTOR.ID, DOCTOR.EMAIL, DOCTOR.NAME, 'DOCTOR' AS TYPE from DASH5082.DOCTOR WHERE APPROVE='0' UNION SELECT PHARMACY.ID, PHARMACY.EMAIL, PHARMACY.NAME, 'PHARMACY' AS TYPE from DASH5082.PHARMACY WHERE APPROVE='0';";
    dbQuery(query, function(result) {
        var query = "SELECT DOCTOR.ID, DOCTOR.EMAIL, DOCTOR.NAME, 'DOCTOR' AS TYPE, DOCTOR.ACTIVE from DASH5082.DOCTOR WHERE APPROVE='1' UNION SELECT PHARMACY.ID, PHARMACY.EMAIL, PHARMACY.NAME, 'PHARMACY' AS TYPE, PHARMACY.ACTIVE from DASH5082.PHARMACY WHERE APPROVE='1';";
        dbQuery(query, function(result2) {
            //console.log(result[0].ID);
            var base = req.protocol + '://' + req.get('host');
            // redirect with data
            //res.send({data: result});
            res.render('admin/manage_users', {base: base, non_approved_users: result, approved_users: result2});  
        });
        
    });
});


app.get('/forgotpassword', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    res.render('forgot_password', { base: base });
});




app.post('/doctor/forgotpassword', function(req, res){
    //console.log(Users);
    //console.log(req.session.user);
    if(!req.body.email){
        res.send({message: "failed", fpassword_error: "Email is required"});
    }
    else
    {
        var query = "SELECT * from DASH5082.DOCTOR WHERE EMAIL ='" + req.body.email + "';";
        var result = dbQuery(query, function(result) {
            //console.log(result[0].ID);

            if(result.length > 0)
            {
                //generate random token
                // Generate a 20 character alpha-numeric token:
                var token = randtoken.generate(120);

                //Delete old tokens if exists
                var query = "DELETE from DASH5082.DOCTOR_FORGOT_PASSWORD WHERE DOCTOR_ID ='" + result[0].ID + "';";
                dbQuery(query, function(result2) {
                    //insert new token into the database
                    var query = "INSERT INTO DASH5082.DOCTOR_FORGOT_PASSWORD (DOCTOR_ID, TOKEN, CREATED_AT) values ('" + result[0].ID + "', '" + token + "', TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));";
                    dbQuery(query, function(result3) {});
                });
                
                var base = req.protocol + '://' + req.get('host');

                var link = base + '/doctor/resetpassword/' + token;
                //send email
                var mailOptions = {
                    from: 'chemofinder@gmail.com', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Password Recovery', // Subject line
                    template: 'forgot_password_mail',
                    context: {
                        link: link
                    }
                    //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                        res.json({message: 'error'});
                    }else{
                        console.log('Message sent: ' + info.response);
                        res.json({message: info.response});
                    };
                });
            }
            else
            {
                res.send({message: "failed", login_error: "This email is not registered"});
            }
        });
    }    
});



app.post('/pharmacy/forgotpassword', function(req, res){
    //console.log(Users);
    //console.log(req.session.user);
    if(!req.body.email){
        res.send({message: "failed", fpassword_error: "Email is required"});
    }
    else
    {
        var query = "SELECT * from DASH5082.PHARMACY WHERE EMAIL ='" + req.body.email + "';";
        var result = dbQuery(query, function(result) {
            //console.log(result[0].ID);

            if(result.length > 0)
            {
                //generate random token
                // Generate a 20 character alpha-numeric token:
                var token = randtoken.generate(120);

                //Delete old tokens if exists
                var query = "DELETE from DASH5082.PHARMACY_FORGOT_PASSWORD WHERE PHARMACY_ID ='" + result[0].ID + "';";
                dbQuery(query, function(result2) {
                    //insert new token into the database
                    var query = "INSERT INTO DASH5082.PHARMACY_FORGOT_PASSWORD (PHARMACY_ID, TOKEN, CREATED_AT) values ('" + result[0].ID + "', '" + token + "', TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));";
                    dbQuery(query, function(result3) {});
                });
                
                var base = req.protocol + '://' + req.get('host');

                var link = base + '/pharmacy/resetpassword/' + token;
                //send email
                var mailOptions = {
                    from: 'chemofinder@gmail.com', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Password Recovery', // Subject line
                    template: 'forgot_password_mail',
                    context: {
                        link: link
                    }
                    //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                        res.json({message: 'error'});
                    }else{
                        console.log('Message sent: ' + info.response);
                        res.json({message: info.response});
                    };
                });
            }
            else
            {
                res.send({message: "failed", login_error: "This email is not registered"});
            }
        });
    }    
});


app.get('/doctor/resetpassword/:token', function(req, res){

    // check if the token exists
    var query = "SELECT * from DASH5082.DOCTOR_FORGOT_PASSWORD WHERE TOKEN ='" + req.params.token + "';";
    dbQuery(query, function(result) {
        if(result.length > 0)
        {
            // check the expiration date of the token
            var tokenDate = new Date(result[0].CREATED_AT);
            var now = new Date();

            //get difference in milliseconds
            var diff = Math.abs(now-tokenDate);
            //get difference in hours
            diff = diff/(1000*60*60)
            console.log(diff);

            if(diff > 3)
            {
                res.send("404 Not Found");       
            }
            else
            {
                // res.send(req.params.token);
                // render change password page
                var base = req.protocol + '://' + req.get('host');
                res.render('doctor/reset_password', { base: base });
            }
        }
        else
        {
            res.send("404 Not Found");
        }
    });    
    
    //res.send("tagId is set to " + req.params.token);
    // var base = req.protocol + '://' + req.get('host');
    // res.render('forgot_password', { base: base });
});

app.get('/pharmacy/resetpassword/:token', function(req, res){

    // check if the token exists
    var query = "SELECT * from DASH5082.PHARMACY_FORGOT_PASSWORD WHERE TOKEN ='" + req.params.token + "';";
    dbQuery(query, function(result) {
        if(result.length > 0)
        {
            // check the expiration date of the token
            var tokenDate = new Date(result[0].CREATED_AT);
            var now = new Date();

            //get difference in milliseconds
            var diff = Math.abs(now-tokenDate);
            //get difference in hours
            diff = diff/(1000*60*60)
            console.log(diff);

            if(diff > 3)
            {
                res.send("404 Not Found");       
            }
            else
            {
                // res.send(req.params.token);
                // render change password page
                var base = req.protocol + '://' + req.get('host');
                res.render('pharmacy/reset_password', { base: base });
            }
        }
        else
        {
            res.send("404 Not Found");
        }
    });    
    
    //res.send("tagId is set to " + req.params.token);
    // var base = req.protocol + '://' + req.get('host');
    // res.render('forgot_password', { base: base });
});

app.post('/doctor/resetpassword', function(req, res){
    // check if the token exists
    var query = "SELECT * from DASH5082.DOCTOR_FORGOT_PASSWORD WHERE TOKEN ='" + req.body.token + "';";
    dbQuery(query, function(result) {
        if(result.length > 0)
        {
            // check the expiration date of the token
            var tokenDate = new Date(result[0].CREATED_AT);
            var now = new Date();

            //get difference in milliseconds
            var diff = Math.abs(now-tokenDate);
            //get difference in hours
            diff = diff/(1000*60*60);
            console.log(diff);

            if(diff > 3)
            {
                res.send("404 Not Found");       
            }
            else
            {
                var jsonObj = {};
                var valid = true;
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
                if(valid)
                {    
                    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                      // Store hash in your password DB.
                      // enter new pharmacy to the db
                      var query = "INSERT INTO DASH5082.DOCTOR (PASSWORD) VALUES ('" + hash + "');";
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
        }
        else
        {
            res.send("404 Not Found");
        }
    });
});

app.post('/pharmacy/resetpassword', function(req, res){
    // check if the token exists
    var query = "SELECT * from DASH5082.PHARMACY_FORGOT_PASSWORD WHERE TOKEN ='" + req.body.token + "';";
    dbQuery(query, function(result) {
        if(result.length > 0)
        {
            // check the expiration date of the token
            var tokenDate = new Date(result[0].CREATED_AT);
            var now = new Date();

            //get difference in milliseconds
            var diff = Math.abs(now-tokenDate);
            //get difference in hours
            diff = diff/(1000*60*60);
            console.log(diff);

            if(diff > 3)
            {
                res.send("404 Not Found");       
            }
            else
            {
                var jsonObj = {};
                var valid = true;
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
                if(valid)
                {    
                    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                      // Store hash in your password DB.
                      // enter new pharmacy to the db
                      var query = "INSERT INTO DASH5082.PHARMACY (PASSWORD) VALUES ('" + hash + "');";
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
        }
        else
        {
            res.send("404 Not Found");
        }
    });
});

app.post('/admin/approvedoctor', function(req, res){
    var query = "UPDATE DOCTOR SET APPROVE='1' WHERE ID=" + req.body.id + ";";
    dbQuery(query, function(newResult) {});
    res.send({mein: req.body.id});
});

app.post('/admin/approvepharmacy', function(req, res){
    var query = "UPDATE DOCTOR SET APPROVE='1' WHERE ID=" + req.body.id + ";";
    dbQuery(query, function(newResult) {});
    res.send({mein: req.body.id});
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


app.get('/doctor', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    res.render('doctor/search_medicines', { base: base });
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/');
});

app.use('/protected_page', function(err, req, res, next){
console.log(err);
    //User should be authenticated! Redirect him to log in.
    res.redirect('/login');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
