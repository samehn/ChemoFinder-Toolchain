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
var RandExp = require('randexp');
require('cf-deployment-tracker-client').track();

app.set('view engine', 'jade');

app.set('views','./views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "297e6dwdt7dtw7dtta"}));

// all environments
app.set('port', process.env.VCAP_APP_PORT || 3000);
app.set('host', process.env.VCAP_APP_HOST || 'localhost');
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

app.get('/', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    res.render('user/home', { base: base });
  });

app.get('/admin/dashboard', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    res.render('admin/dashboard', { base: base });
});

function validateWithRegex(regex, email) {
    return regex.test(email);
}

app.post('/user/signup', function(req, res){
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

    //validate type
    if(!req.body.type)
    {
        jsonObj['type_error'] = "Type is required";
        valid = false;
    }

    //validate street
    if(!req.body.street && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['street_error'] = "Street is required";
        valid = false;
    }

    //validate city
    if(!req.body.city && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['city_error'] = "City is required";
        valid = false;
    }

    //validate state
    if(!req.body.state && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['state_error'] = "State is required";
        valid = false;
    }

    //validate zip
    if(!req.body.zip && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['zip_error'] = "Zip Code is required";
        valid = false;
    }

    //validate phone number
    if(!req.body.phone_number && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['phone_number_error'] = "Phone number is required";
        valid = false;
    }

    //validate open from
    if(!req.body.open_from && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['open_from_error'] = "Open from is required";
        valid = false;
    }

    //validate open to
    if(!req.body.open_to && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['open_to_error'] = "Open to is required";
        valid = false;
    }

    var query = "SELECT * from DASH5082.USER WHERE EMAIL ='" + req.body.email + "';";           
        
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
                    var query;
                    if(req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER")
                    {
                        query = "INSERT INTO DASH5082.USER (EMAIL, PASSWORD, NAME, PHONE_NUMBER, STREET, CITY, STATE, ZIP, OPEN_FROM, OPEN_TO, TYPE, FIRST_LOGIN, ACTIVE, APPROVE) VALUES ('" + req.body.email + "','" + hash + "','" + req.body.name + "','" + req.body.phone_number + "','" + req.body.street + "','" + req.body.city + "','" + req.body.state + "','" + req.body.zip + "','" + req.body.open_from + "','" + req.body.open_to + "','" + req.body.type + "', '0', '1', '0');"; 
                    }
                    else
                    {
                        query = "INSERT INTO DASH5082.USER (EMAIL, PASSWORD, NAME, STREET, CITY, STATE, ZIP, TYPE, FIRST_LOGIN, ACTIVE, APPROVE) VALUES ('" + req.body.email + "','" + hash + "','" + req.body.name + "','" + req.body.street + "','" + req.body.city + "','" + req.body.state + "','" + req.body.zip + "','" + req.body.type + "', '0', '1', '0');";
                    }
                    dbQuery(query, function(newResult) {
                        //Send Confirmation Email
                        var link = req.protocol + '://' + req.get('host') + '/admin/manage_users';
                        var mailOptions = {
                            from: 'chemofinder@gmail.com', // sender address
                            to: 'chemofinder@gmail.com', // list of receivers
                            subject: 'New Registration Request', // Subject line
                            template: 'new_registration_request_mail',
                            context: {
                                link: link
                            }
                            //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                        };
                        sendEmail(mailOptions);

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

app.post('/admin/addnewuser', function(req, res){
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

    //validate name
    if(!req.body.name)
    {
        jsonObj['name_error'] = "Name is required";
        valid = false;
    }

    //validate type
    if(!req.body.type)
    {
        jsonObj['type_error'] = "Type is required";
        valid = false;
    }

    //validate street
    if(!req.body.street && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['street_error'] = "Street is required";
        valid = false;
    }

    //validate city
    if(!req.body.city && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['city_error'] = "City is required";
        valid = false;
    }

    //validate state
    if(!req.body.state && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['state_error'] = "State is required";
        valid = false;
    }

    //validate zip
    if(!req.body.zip && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['zip_error'] = "Zip Code is required";
        valid = false;
    }

    //validate phone number
    if(!req.body.phone_number && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['phone_number_error'] = "Phone number is required";
        valid = false;
    }

    //validate open from
    if(!req.body.open_from && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['open_from_error'] = "Open from is required";
        valid = false;
    }

    //validate open to
    if(!req.body.open_to && (req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER"))
    {
        jsonObj['open_to_error'] = "Open to is required";
        valid = false;
    }

    var query = "SELECT * from DASH5082.USER WHERE EMAIL ='" + req.body.email + "';";           
        
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
                    var query;
                    if(req.body.type == "PHARMACY" || req.body.type == "TREATMENT CENTER")
                    {
                        query = "INSERT INTO DASH5082.USER (EMAIL, PASSWORD, NAME, PHONE_NUMBER, STREET, CITY, STATE, ZIP, OPEN_FROM, OPEN_TO, TYPE, FIRST_LOGIN, ACTIVE, APPROVE) VALUES ('" + req.body.email + "','" + hash + "','" + req.body.name + "','" + req.body.phone_number + "','" + req.body.street + "','" + req.body.city + "','" + req.body.state + "','" + req.body.zip + "','" + req.body.open_from + "','" + req.body.open_to + "','" + req.body.type + "', '1', '1', '1');"; 
                    }
                    else
                    {
                        query = "INSERT INTO DASH5082.USER (EMAIL, PASSWORD, NAME, STREET, CITY, STATE, ZIP, TYPE, FIRST_LOGIN, ACTIVE, APPROVE) VALUES ('" + req.body.email + "','" + hash + "','" + req.body.name + "','" + req.body.street + "','" + req.body.city + "','" + req.body.state + "','" + req.body.zip + "','" + req.body.type + "', '1', '1', '1');";
                    }
                    dbQuery(query, function(newResult) {
                        //Send Confirmation Email
                        var link = req.protocol + '://' + req.get('host');
                        var mailOptions = {
                            from: 'chemofinder@gmail.com', // sender address
                            to: req.body.email, // list of receivers
                            subject: 'New Account', // Subject line
                            template: 'new_account_mail',
                            context: {
                                link: link,
                                password: req.body.password
                            }
                            //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                        };
                        sendEmail(mailOptions);

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

app.post('/user/login', function(req, res){
    //console.log(Users);
    //console.log(req.session.user);
    if(!req.body.email || !req.body.password){
        res.send({message: "failed", login_error:"Please enter both email and password"});
    }
    else{
            var query = "SELECT * from DASH5082.USER WHERE EMAIL ='" + req.body.email + "';";
            var result = dbQuery(query, function(result) {
                //console.log(result[0].ID);

                if(result.length > 0)
                {
                    bcrypt.compare(req.body.password, result[0].PASSWORD, function(err, cmp) {
                        // res == true
                        if(cmp)
                        {
                            if(result[0].APPROVE == '0')
                            {
                                res.send({message: "failed", login_error: "Your account is not approved yet"});
                            }
                            else if(result[0].ACTIVE == '0')
                            {
                                res.send({message: "failed", login_error: "Your account is suspended, " + result[0].SUSPENSION_REASON});
                            }
                            else
                            {
                                req.session.user = result[0];
                                var type = result[0].TYPE;
                                if(result[0].FIRST_LOGIN == '1')
                                {
                                    res.send({message: "first login", type: type});
                                }
                                else
                                {
                                    res.send({message: "success", type: type});
                                }
                            }
                        }
                        else
                        {
                           res.send({message: "failed", login_error: "Invalid Credentials"}); 
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

app.get('/user/forgotpassword', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    res.render('user/forgot_password', { base: base });
});

app.post('/user/forgotpassword', function(req, res){
    //console.log(Users);
    //console.log(req.session.user);
    if(!req.body.email){
        res.send({message: "failed", fpassword_error: "Email is required"});
    }
    else
    {
        var query = "SELECT * from DASH5082.USER WHERE EMAIL ='" + req.body.email + "';";
        var result = dbQuery(query, function(result) {
            //console.log(result[0].ID);

            if(result.length > 0)
            {
                //generate random token
                // Generate a 20 character alpha-numeric token:
                var token = randtoken.generate(120);

                //Delete old tokens if exists
                var query = "DELETE from DASH5082.USER_FORGOT_PASSWORD WHERE USER_ID ='" + result[0].ID + "';";
                dbQuery(query, function(result2) {
                    //insert new token into the database
                    var query = "INSERT INTO DASH5082.USER_FORGOT_PASSWORD (USER_ID, TOKEN, CREATED_AT) values ('" + result[0].ID + "', '" + token + "', TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));";
                    dbQuery(query, function(result3) {
                        res.send({message: "success"});
                        var base = req.protocol + '://' + req.get('host');
                        var link = base + '/user/resetpassword/' + token;
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
                        sendEmail(mailOptions);
                    });
                });
            }
            else
            {
                res.send({message: "failed", login_error: "This email is not registered"});
            }
        });
    }    
});

function sendEmail(mailOptions) {
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            //res.json({message: 'error'});
        }else{
            console.log('Message sent: ' + info.response);
            //res.json({message: info.response});
        };
    });
}

app.get('/user/resetpassword/:token', function(req, res){

    // check if the token exists
    var query = "SELECT * from DASH5082.USER_FORGOT_PASSWORD WHERE TOKEN ='" + req.params.token + "';";
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
                res.render('user/reset_password', { base: base });
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

app.post('/user/resetpassword', function(req, res){
    // check if the token exists
    var query = "SELECT * from DASH5082.USER_FORGOT_PASSWORD WHERE TOKEN ='" + req.body.token + "';";
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
                      var query = "INSERT INTO DASH5082.USER (PASSWORD) VALUES ('" + hash + "');";
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

app.get('/admin/manage_users', function(req, res) {
    var query = "SELECT ID, EMAIL, NAME, TYPE from DASH5082.USER WHERE APPROVE='0'";
    dbQuery(query, function(result) {
        var query = "SELECT ID, EMAIL, NAME, TYPE, ACTIVE, SUSPENSION_REASON from DASH5082.USER WHERE APPROVE='1'";
        dbQuery(query, function(result2) {
            //console.log(result[0].ID);
            var base = req.protocol + '://' + req.get('host');
            // redirect with data
            //res.send({data: result});
            res.render('admin/manage_users', {base: base, non_approved_users: result, approved_users: result2});  
        });
        
    });
});

app.post('/admin/approveuser', function(req, res){
    var query = "UPDATE USER SET APPROVE='1' WHERE ID=" + req.body.id + ";";
    dbQuery(query, function(newResult) {
        var query = "SELECT EMAIL FROM USER WHERE ID=" + req.body.id + ";";
        dbQuery(query, function(result) 
        {
            if(result.length > 0)
            {
                var link = req.protocol + '://' + req.get('host');
                var mailOptions = {
                    from: 'chemofinder@gmail.com', // sender address
                    to: result[0].EMAIL, // list of receivers
                    subject: 'Account Approval', // Subject line
                    template: 'account_approval_mail',
                    context: {
                        link: link
                    }
                    //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                };
                sendEmail(mailOptions);
                res.send({message: req.body.id});
            }
            else
            {
                res.send({message: "failed"});
            }
        });
        
    });
});

app.post('/admin/suspenduser', function(req, res){

    var query = "UPDATE USER SET ACTIVE='0', SUSPENSION_REASON='" + req.body.suspension_reason + "' WHERE ID=" + req.body.id + ";";
    dbQuery(query, function(newResult) {
        var query = "SELECT EMAIL FROM USER WHERE ID=" + req.body.id + ";";
        dbQuery(query, function(result) 
        {
            if(result.length > 0)
            {
                console.log(req.body.suspension_email);
                if(req.body.suspension_email == 'true')
                {
                    var mailOptions = {
                        from: 'chemofinder@gmail.com', // sender address
                        to: result[0].EMAIL, // list of receivers
                        subject: 'Account Suspension', // Subject line
                        template: 'account_suspension_mail',
                        context: {
                            message: req.body.suspension_reason
                        }
                        //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                    };
                    sendEmail(mailOptions);    
                }
                
                res.send({message: req.body.id});
            }
            else
            {
                res.send({message: "failed"});
            }
        });
    });
});


app.post('/admin/activateuser', function(req, res){

    var query = "UPDATE USER SET ACTIVE='1' WHERE ID=" + req.body.id + ";";
    dbQuery(query, function(newResult) {
        var query = "SELECT EMAIL FROM USER WHERE ID=" + req.body.id + ";";
        dbQuery(query, function(result) 
        {
            if(result.length > 0)
            {
                var link = req.protocol + '://' + req.get('host');
                var mailOptions = {
                    from: 'chemofinder@gmail.com', // sender address
                    to: result[0].EMAIL, // list of receivers
                    subject: 'Account Activation', // Subject line
                    template: 'account_activation_mail',
                    context: {
                        link: link
                    }
                    //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                };
                sendEmail(mailOptions);
                res.send({message: req.body.id});
            }
            else
            {
                res.send({message: "failed"});
            }
        });
    });
});

app.get('/generaterandompassword', function(req, res) {
    var random = new RandExp(/^(?=.*[A-Za-z\d])(?=.*[$@$!%*#?&\^\\\/"'<>;:+\-()_~{}\[\]=])[A-Za-z\d$@$!%*#?&\^\\\/"'<>;:+\-()_~{}\[\]=]{8,}$/).gen();
    res.send({random: random});
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