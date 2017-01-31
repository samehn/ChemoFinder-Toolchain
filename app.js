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
var ibmdb = require('ibm_db');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var bcrypt = require('bcrypt');
var randtoken = require('rand-token');
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var dateFormat = require('dateformat');
var RandExp = require('randexp');
var fileUpload = require('express-fileupload');
if(typeof require !== 'undefined') XLSX = require('xlsx');


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
                    // console.log(err);
                    // console.log(result);
                    conn.close(function(){
                        console.log("Connection Closed");
                        });
                    // console.log(result);
                    return callback(result);     
                });

            }
        } );
}

function dbQuerySync(query) {
    var option = { connectTimeout : 3000000 };// Connection Timeout after 40 seconds. 
    var conn = ibmdb.openSync(connString, option);
    var rows = conn.querySync(query);
    // console.log(query);
    // console.log(rows);
    return rows;
}


require('./routes/home')(app);

// setInterval(function () { 
//     console.log('second passed'); 
// }, 1000);

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

app.post('/admin/updatemedicine', function(req, res){
    var jsonObj = {};
    var valid = true;

    if(!req.body.medicine_id)
    {
        jsonObj['generic_name_error'] = "Generic Name is required";
        valid = false;
    }

    //validate generic name
    if(!req.body.generic_name)
    {
        jsonObj['generic_name_error'] = "Generic Name is required";
        valid = false;
    }
    
    
    //validate brand name
    if(!req.body.brand_name)
    {
        jsonObj['brand_name_error'] = "Brand Name is required";
        valid = false;
    }
    

    //validate name
    if(!req.body.form)
    {
        jsonObj['form_error'] = "Form is required";
        valid = false;
    }

    //validate type
    if(!req.body.strength)
    {
        jsonObj['strength_error'] = "Strength is required";
        valid = false;
    }

    //validate type
    if(!req.body.strength_unit)
    {
        jsonObj['strength_unit_error'] = "Strength Unit is required";
        valid = false;
    }

    //validate type
    if(!req.body.manufacturer)
    {
        jsonObj['manufacturer_error'] = "Manufacturer is required";
        valid = false;
    }

    if(!req.body.sra)
    {
        jsonObj['sra_error'] = "SRA is required";
        valid = false;
    }

    if(!req.body.source)
    {
        jsonObj['source_error'] = "Source is required";
        valid = false;
    }

    if(!req.body.extract_date)
    {
        jsonObj['extract_date_error'] = "Extract Date is required";
        valid = false;
    }

    var query = "SELECT * from DASH5082.MEDICINE WHERE ID =" + req.body.medicine_id + ";";           
        
    var result = dbQuery(query, function(result) {
        console.log(result);
        if(result.length == 0)
        {
            jsonObj['generic_name_error'] = "This is not a valid medicine"
            valid = false;
            jsonObj['message'] = "failed";
            res.send(jsonObj);
        }
        else
        {
            if(valid)
            {    
                var query = "UPDATE DASH5082.MEDICINE SET GENERIC_NAME = '" + req.body.generic_name + "', BRAND_NAME = '" + req.body.brand_name + "', FORM = '" + req.body.form + "', STRENGTH = '" + req.body.strength + "', STRENGTH_UNIT = '" + req.body.strength_unit + "', ROUTE = '" + req.body.route + "', MANUFACTURER = '" + req.body.manufacturer + "', SRA = '" + req.body.sra + "', APPROVAL_DATE = TIMESTAMP_FORMAT(" + req.body.approval_date + ", 'DD-Month-YY'), SOURCE = '" + req.body.source + "', EXTRACT_DATE = TIMESTAMP_FORMAT(" + req.body.extract_date + ", 'DD-Month-YY') WHERE ID = " + req.body.medicine_id + ";";
                console.log(query);
                dbQuery(query, function(newResult) {

                    jsonObj['message'] = "success";
                    res.send(jsonObj);
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

app.post('/admin/addnewmedicine', function(req, res){
    var jsonObj = {};
    var valid = true;

    //validate generic name
    if(!req.body.generic_name)
    {
        jsonObj['generic_name_error'] = "Generic Name is required";
        valid = false;
    }
    
    
    //validate brand name
    if(!req.body.brand_name)
    {
        jsonObj['brand_name_error'] = "Brand Name is required";
        valid = false;
    }
    

    //validate name
    if(!req.body.form)
    {
        jsonObj['form_error'] = "Form is required";
        valid = false;
    }

    //validate type
    if(!req.body.strength)
    {
        jsonObj['strength_error'] = "Strength is required";
        valid = false;
    }

    //validate type
    if(!req.body.strength_unit)
    {
        jsonObj['strength_unit_error'] = "Strength Unit is required";
        valid = false;
    }

    //validate type
    if(!req.body.manufacturer)
    {
        jsonObj['manufacturer_error'] = "Manufacturer is required";
        valid = false;
    }

    if(!req.body.sra)
    {
        jsonObj['sra_error'] = "SRA is required";
        valid = false;
    }

    if(!req.body.source)
    {
        jsonObj['source_error'] = "Source is required";
        valid = false;
    }

    if(!req.body.extract_date)
    {
        jsonObj['extract_date_error'] = "Extract Date is required";
        valid = false;
    }

    var query = "SELECT * from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + req.body.generic_name + "' AND BRAND_NAME = '" + req.body.brand_name + "' AND FORM = '" + req.body.form + "' AND STRENGTH = '" + req.body.strength + "' AND STRENGTH_UNIT = '" + req.body.strength_unit + "' AND MANUFACTURER = '" + req.body.manufacturer + "';";           
        
    var result = dbQuery(query, function(result) {
        console.log(result);
        if(result.length != 0)
        {
            jsonObj['generic_name_error'] = "This Medicine is already exists"
            valid = false;
            jsonObj['message'] = "failed";
            res.send(jsonObj);
        }
        else
        {
            if(valid)
            {    
                var query = "INSERT INTO DASH5082.MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, ROUTE, MANUFACTURER, SRA, APPROVAL_DATE, SOURCE, EXTRACT_DATE) VALUES ('" + req.body.generic_name + "','" + req.body.brand_name + "','" + req.body.form + "','" + req.body.strength + "','" + req.body.strength_unit + "','" + req.body.route + "','" + req.body.manufacturer + "','" + req.body.sra + "','" + req.body.approval_date + "','" + req.body.source + "','" + req.body.extract_date + "');"; 
                dbQuery(query, function(newResult) {

                    jsonObj['message'] = "success";
                    res.send(jsonObj);
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

app.post('/admin/addnewadmin', function(req, res){
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

    var query = "SELECT * from DASH5082.ADMIN WHERE EMAIL ='" + req.body.email + "';";           
        
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
            var query = "SELECT * from DASH5082.ADMIN WHERE USERNAME ='" + req.body.name + "';";           
        
            var result = dbQuery(query, function(result2) {
                console.log(result2);
                if(result2.length != 0)
                {
                    jsonObj['name_error'] = "This name is already used"
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
                            
                            
                            var query = "INSERT INTO DASH5082.ADMIN (EMAIL, PASSWORD, USERNAME) VALUES ('" + req.body.email + "','" + hash + "','" + req.body.name + "');";
                            
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
                                
                                req.session.user_id = result[0].ID;
                                req.session.user_first_login = result[0].FIRST_LOGIN;
                                var type = result[0].TYPE;
                                req.session.user_type = type;
                                
                                res.send({message: "success", type: type});
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
        var query = "SELECT * from DASH5082.ADMIN WHERE USERNAME ='" + req.body.email + "' OR EMAIL ='" + req.body.email + "';";
        var result = dbQuery(query, function(result) {
            console.log(result[0].ID);

            if(result.length != 0)
            {
                bcrypt.compare(req.body.password, result[0].PASSWORD, function(err, cmp) {
                    // res == true
                    if(cmp)
                    {
                        req.session.user = result[0];
                        res.send({message: "success"});
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

app.get('/user/forgotpassword', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    var user_type = 'user';
    res.render('user/forgot_password', {user_type: user_type, base: base });
});

app.get('/admin/forgotpassword', function(req, res){
    var base = req.protocol + '://' + req.get('host');
    var user_type = 'admin';
    res.render('user/forgot_password', {user_type: user_type, base: base });
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

app.post('/admin/forgotpassword', function(req, res){
    //console.log(Users);
    //console.log(req.session.user);
    if(!req.body.email){
        res.send({message: "failed", fpassword_error: "Email is required"});
    }
    else
    {
        var query = "SELECT * from DASH5082.ADMIN WHERE EMAIL ='" + req.body.email + "';";
        var result = dbQuery(query, function(result) {
            //console.log(result[0].ID);

            if(result.length > 0)
            {
                //generate random token
                // Generate a 20 character alpha-numeric token:
                var token = randtoken.generate(120);

                //Delete old tokens if exists
                var query = "DELETE from DASH5082.ADMIN_FORGOT_PASSWORD WHERE ADMIN_ID ='" + result[0].ID + "';";
                dbQuery(query, function(result2) {
                    //insert new token into the database
                    var query = "INSERT INTO DASH5082.ADMIN_FORGOT_PASSWORD (ADMIN_ID, TOKEN, CREATED_AT) values ('" + result[0].ID + "', '" + token + "', TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));";
                    dbQuery(query, function(result3) {
                        res.send({message: "success"});
                        var base = req.protocol + '://' + req.get('host');
                        var link = base + '/admin/resetpassword/' + token;
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
                var user_type = 'user';
                res.render('user/reset_password', { base: base, user_type: user_type });
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

app.get('/admin/resetpassword/:token', function(req, res){

    // check if the token exists
    var query = "SELECT * from DASH5082.ADMIN_FORGOT_PASSWORD WHERE TOKEN ='" + req.params.token + "';";
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
                var user_type = 'admin';
                res.render('user/reset_password', { base: base, user_type: user_type });
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
                      var query = "UPDATE DASH5082.USER SET PASSWORD ='" + hash + "' WHERE ID =" + result[0].USER_ID + ";";
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

app.post('/admin/resetpassword', function(req, res){
    // check if the token exists
    var query = "SELECT * from DASH5082.ADMIN_FORGOT_PASSWORD WHERE TOKEN ='" + req.body.token + "';";
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
                jsonObj['message'] = "failed";
                jsonObj['password_error'] = "This link is already expired";
                res.send(jsonObj);       
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
                      var query = "UPDATE DASH5082.ADMIN SET PASSWORD ='" + hash + "' WHERE ID =" + result[0].ADMIN_ID + ";";
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

app.post('/admin/get_user_history', function(req, res) {
    var query = "SELECT * from DASH5082.USER_SUSPENSION WHERE USER_ID = " + req.body.id ;
    dbQuery(query, function(result) {
        if(result.length > 0){
            res.send({message:'success', results:result});
        }
        else{
            res.send({message:'failed'});
        }
    });
});

app.get('/admin/manage_medicines', function(req, res) {

    var query = "SELECT * from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
    dbQuery(query, function(result) {
        var query = "SELECT * from DASH5082.MEDICINE WHERE SRA IS NULL";
        dbQuery(query, function(result2) {
            //console.log(result[0].ID);
            var base = req.protocol + '://' + req.get('host');
            // redirect with data
            //res.send({data: result});
            var data = {base: base, approved_medicines: result,  non_approved_medicines: result2};
            if(req.session.extention_error)
            {
                data['extention_error'] = true;
                req.session.extention_error = null;
            }
            if(req.session.format_error)
            {
                data['format_error'] = req.session.format_error;
                req.session.format_error = null;
            }  
            if(req.session.success_message)
            {
                data['success_message'] = req.session.success_message;
                req.session.success_message = null;
            } 
            res.render('admin/manage_medicines', data);  
        });
        
    });
});

app.get('/admin/admins_list', function(req, res) {

    var query = "SELECT * from DASH5082.ADMIN";
    dbQuery(query, function(result) {
        //console.log(result[0].ID);
        var base = req.protocol + '://' + req.get('host');
        // redirect with data
        //res.send({data: result});
        var data = {base: base, admins: result};  
        res.render('admin/admins_list', data);
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

    var query = "UPDATE USER SET ACTIVE='0' WHERE ID=" + req.body.id + ";";
    dbQuery(query, function(newResult) {
        var query = "INSERT INTO DASH5082.USER_SUSPENSION (USER_ID, SUSPENSION_REASON, CREATED_AT) VALUES (" + req.body.id + ", '" + req.body.suspension_reason + "', TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));";
        dbQuerySync(query);
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
        var query = "INSERT INTO DASH5082.USER_SUSPENSION (USER_ID, SUSPENSION_REASON, TYPE, CREATED_AT) VALUES (" + req.body.id + ", '" + req.body.suspension_reason + "', 1, TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));";
        dbQuerySync(query);
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

app.post('/admin/deleteuser', function(req, res){

    var query = "DELETE FROM USER WHERE ID=" + req.body.id + ";";
    dbQuery(query, function(newResult) {
        res.send({message: "success"});
    });
});

app.get('/admin/downloadtemplate', function(req, res){
  var file = __dirname + '/public/downloads/medicinelist_example_data.xlsx';
  res.download(file); // Set disposition and send it.
});

app.get('/generaterandompassword', function(req, res) {
    var random = new RandExp(/(?=.*[A-Za-z\d])@[A-Za-z\d]{8,10}/).gen();
    res.send({random: random});
});

function parsingApprovedMedicines(req, callback) {
    var workbook = XLSX.readFile('./public/uploads/medicines/approved_medicines.xlsx');
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];

    var flag = true;
    var format_error_flag = false;
    var i = 2;
    var warning_message = "<div class='alert alert-danger error-form'> Some medicines cannot be added/updated due to the following: <ul>";
    while(flag)
    {
        var wm = "<li> On line " + i + ":";

        var id, generic_name, brand_name, form, strength, strength_unit, route, manufacturer, sra, approval_date, source, extract_date;

        var id_address = 'A'+i;
        var id_cell = worksheet[id_address];
        
        if(id_cell == undefined)
        {
            flag = false;
            warning_message = warning_message + '</ul></div>';
            if(format_error_flag)
            {
                req.session.format_error = warning_message;
            }
            callback();//res.redirect('/admin/uploadmedicines');
            break;
        }
        else
        {
            id = id_cell.v;
        }

        var generic_name_address = 'B'+i;
        var generic_name_cell = worksheet[generic_name_address];
        if(generic_name_cell != undefined)
        {
            generic_name = generic_name_cell.v;
        }
        else
        {
            generic_name = '';
        }

        var brand_name_address = 'C'+i;
        var brand_name_cell = worksheet[brand_name_address];
        if(brand_name_cell != undefined)
        {
            brand_name = brand_name_cell.v;
        }
        else
        {
            brand_name = '';
        }
        
        var form_address = 'D'+i;
        var form_cell = worksheet[form_address];
        if(form_cell != undefined)
        {
            form = form_cell.v;
        }
        else
        {
            form = '';
        }

        var strength_address = 'E'+i;
        var strength_cell = worksheet[strength_address];
        if(strength_cell != undefined)
        {
            strength = strength_cell.v;
        }
        else
        {
            strength = '';
        }
        
        var strength_unit_address = 'F'+i;
        var strength_unit_cell = worksheet[strength_unit_address];
        if(strength_unit_cell != undefined)
        {
            strength_unit = strength_unit_cell.v;
        }
        else
        {
            strength_unit = '';
        }

        var route_address = 'G'+i;
        var route_cell = worksheet[route_address];
        if(route_cell != undefined)
        {
            route = route_cell.v;
        }
        else
        {
            route = '';
        }

        var manufacturer_address = 'H'+i;
        var manufacturer_cell = worksheet[manufacturer_address];
        if(manufacturer_cell != undefined)
        {
            manufacturer = manufacturer_cell.v;
        }
        else
        {
            manufacturer = '';
        }

        var sra_address = 'I'+i;
        var sra_cell = worksheet[sra_address];
        if(sra_cell != undefined)
        {
            sra = sra_cell.v;
        }
        else
        {
            sra = '';
        }

        var approval_date_address = 'J'+i;
        var approval_date_cell = worksheet[approval_date_address];
        if(approval_date_cell != undefined)
        {
            approval_date = "'" +approval_date_cell.w + "'";
        }
        else
        {
            approval_date = 'NULL';
        }

        var source_address = 'K'+i;
        var source_cell = worksheet[source_address];
        if(source_cell != undefined)
        {
            source = source_cell.v;
        }
        else
        {
            source = '';
        }

        var extract_date_address = 'L'+i;
        var extract_date_cell = worksheet[extract_date_address];
        console.log(extract_date_cell);
        if(extract_date_cell != undefined)
        {
            extract_date = "'" + extract_date_cell.w + "'";
        }
        else
        {
            extract_date = 'NULL';
        }
        var jsonObj = {};
        var valid = true;

        //validate generic name
        if(!generic_name)
        {
            jsonObj['generic_name_error'] = "Generic Name is required";
            wm = wm + 'generic name is required, ';
            valid = false;
        }
        
        
        //validate brand name
        if(!brand_name)
        {
            jsonObj['brand_name_error'] = "Brand Name is required";
            wm = wm + 'brand name is required, ';
            valid = false;
        }
        

        //validate name
        if(!form)
        {
            jsonObj['form_error'] = "Form is required";
            wm = wm + 'form is required, ';
            valid = false;
        }

        //validate type
        if(!strength)
        {
            jsonObj['strength_error'] = "Strength is required";
            wm = wm + 'strength is required, ';
            valid = false;
        }

        //validate type
        if(!strength_unit)
        {
            jsonObj['strength_unit_error'] = "Strength Unit is required";
            wm = wm + 'strength unit is required, ';
            valid = false;
        }

        //validate type
        if(!manufacturer)
        {
            jsonObj['manufacturer_error'] = "Manufacturer is required";
            wm = wm + 'manufacturer is required, ';
            valid = false;
        }

        if(!sra)
        {
            jsonObj['sra_error'] = "SRA is required";
            wm = wm + 'sra is required, ';
            valid = false;
        }

        if(!source)
        {
            jsonObj['source_error'] = "Source is required";
            wm = wm + 'source is required, ';
            valid = false;
        }

        if(!extract_date)
        {
            jsonObj['extract_date_error'] = "Extract Date is required";
            wm = wm + 'extract date is required, ';
            valid = false;
        }

        var query = "SELECT * from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + generic_name + "' AND BRAND_NAME = '" + brand_name + "' AND FORM = '" + form + "' AND STRENGTH = '" + strength + "' AND STRENGTH_UNIT = '" + strength_unit + "' AND MANUFACTURER = '" + manufacturer + "';";           
        var result = dbQuerySync(query);    
        if(result.length != 0)
        {
            var query = "UPDATE DASH5082.MEDICINE SET ROUTE = '" + route + "', MANUFACTURER = '" + manufacturer + "', SRA = '" + sra + "', APPROVAL_DATE = TIMESTAMP_FORMAT(" + approval_date + ", 'DD-Month-YY'), SOURCE = '" + source + "', EXTRACT_DATE = TIMESTAMP_FORMAT(" + extract_date + ", 'DD-Month-YY') WHERE ID = " + result[0].ID + ";";
            var result = dbQuerySync(query);
        }
        else
        {
            console.log(valid);
            if(valid)
            {    
                var query = "INSERT INTO DASH5082.MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, ROUTE, MANUFACTURER, SRA, APPROVAL_DATE, SOURCE, EXTRACT_DATE) VALUES ('" + generic_name + "','" + brand_name + "','" + form + "','" + strength + "','" + strength_unit + "','" + route + "','" + manufacturer + "','" + sra + "', TIMESTAMP_FORMAT(" + approval_date + ", 'DD-Month-YY'),'" + source + "', TIMESTAMP_FORMAT(" + extract_date + ", 'DD-Month-YY'));"; 
                dbQuerySync(query);       
                jsonObj['message'] = "success";
                    //res.send(jsonObj);
            }
            else
            {
                
                jsonObj['message'] = "failed";
                format_error_flag = true;
                wm = wm.slice(0, -2) + '</li>';
                warning_message = warning_message + wm;
                
                //res.send(jsonObj);
            }
        }
        console.log(jsonObj);
        console.log(brand_name);
        i++;
    }
}


app.post('/admin/uploadmedicines', function(req, res) {
    var sampleFile;
 
    if (!req.files) {
        res.send('No files were uploaded.');
        console.log('No files were uploaded.');
        return;
    }
    sampleFile = req.files.sampleFile;
    var fileArray = sampleFile.name.split('.');
    var extension = fileArray[fileArray.length - 1];
    if(extension == "xlsx")
    {
        sampleFile.mv('./public/uploads/medicines/approved_medicines.xlsx', function(err) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                parsingApprovedMedicines(req, function() {
                    console.log(req.session);
                    res.redirect('/admin/manage_medicines');
                });
                // res.redirect('/admin/uploadmedicines');
                console.log('File uploaded!');
            }
        });
    }
    else
    {
        req.session.extention_error = true;
        res.redirect('/admin/manage_medicines');
    }
    
});

app.get('/getapprovedmedicines', function(req, res){
    var query = "SELECT * from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
    dbQuery(query, function(result) {
        res.send({medicines: result});    
    });
});

app.get('/getmedicinebyid/:id', function(req, res){
    var query = "SELECT * from DASH5082.MEDICINE WHERE ID =" + req.params.id;
    dbQuery(query, function(result) {
        res.send({medicine: result});    
    });
});

app.post('/getmedicineid', function(req, res) {
    var query = "SELECT ID from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + req.body.generic_name + "' AND BRAND_NAME = '" + req.body.brand_name + "' AND FORM = '" + req.body.form + "' AND STRENGTH = '" + req.body.strength + "' AND STRENGTH_UNIT = '" + req.body.strength_unit + "' AND MANUFACTURER = '" + req.body.manufacturer + "';";
    dbQuery(query, function(result) {
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

app.get('/pharmacy', checkSignIn, function(req, res){
    var query = "SELECT *, SL.ID AS STOCK_LIST_ID FROM STOCK_LIST SL JOIN MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE SL.PHARMACY_ID = " + req.session.user_id;
    dbQuery(query, function(result) {
        var query = "SELECT * from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
        var result2 = dbQuerySync(query);
        //console.log(result[0].ID);
        var base = req.protocol + '://' + req.get('host');
        // redirect with data
        //res.send({data: result});
        var data = {base: base, stock_list: result, medicines: result2};
        if(req.session.extention_error)
        {
            data['extention_error'] = true;
            req.session.extention_error = null;
        }
        if(req.session.format_error)
        {
            data['format_error'] = req.session.format_error;
            req.session.format_error = null;
        } 
        res.render('pharmacy/stock_list', data);      
    });
});

app.use('/pharmacy', function(err, req, res, next){
console.log(err);
    if(err == "Error: First Login")
    {
        res.redirect('/user/first_changepassword');
    }
    else
    {
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
    }
});

app.get('/pharmacy/downloadlaststock', checkSignIn, function(req, res){
  var path = '/public/uploads/stocks/stock_list_' + req.session.user_id + '.xlsx';
  var file = __dirname + path;
  if (fs.existsSync('.' + path)) {
    res.download(file); // Set disposition and send it.
  }
  else{
    req.session.format_error = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button> You have no previous stocks to be downloaded </div>';
    res.redirect('/pharmacy');
  }
  
});

app.get('/pharmacy/downloadtemplate', checkSignIn, function(req, res){
  var file = __dirname + '/public/downloads/stocklist_example_data.xlsx';
  res.download(file); // Set disposition and send it.
});

app.use('/pharmacy/downloadtemplate', function(err, req, res, next){
console.log(err);
    if(err == "Error: First Login")
    {
        res.redirect('/user/first_changepassword');
    }
    else
    {
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
    }
});

app.post('/pharmacy/addnewmedicine', function(req, res){
    var jsonObj = {};
    var valid = true;

    //validate generic name
    if(!req.body.generic_name)
    {
        jsonObj['generic_name_error'] = "Generic Name is required";
        valid = false;
    }

    //validate name
    if(!req.body.form)
    {
        jsonObj['form_error'] = "Form is required";
        valid = false;
    }

    //validate type
    if(!req.body.strength)
    {
        jsonObj['strength_error'] = "Strength is required";
        valid = false;
    }

    //validate type
    if(!req.body.strength_unit)
    {
        jsonObj['strength_unit_error'] = "Strength Unit is required";
        valid = false;
    }

    //validate brand name
    if(!req.body.brand_name)
    {
        jsonObj['brand_name_error'] = "Brand Name is required";
        valid = false;
    }

    //validate type
    if(!req.body.manufacturer)
    {
        jsonObj['manufacturer_error'] = "Manufacturer is required";
        valid = false;
    }

    if(!req.body.batch_number)
    {
        jsonObj['batch_number_error'] = "Batch Number is required";
        valid = false;
    }

    if(!req.body.expiry_date)
    {
        jsonObj['expiry_date_error'] = "Expiry Date is required";
        valid = false;
    }

    // if(!req.body.sra)
    // {
    //     jsonObj['sra_error'] = "SRA is required";
    //     valid = false;
    // }

    if(!req.body.pack_size)
    {
        jsonObj['pack_size_error'] = "Pack Size is required";
        valid = false;
    }

    if(!req.body.price)
    {
        jsonObj['price_error'] = "Price per Pack is required";
        valid = false;
    }

    if(!req.body.quantity)
    {
        jsonObj['quantity_error'] = "Quantity is required";
        valid = false;
    }

    // if(!req.body.avg_monthly_consumption)
    // {
    //     jsonObj['avg_monthly_consumption_error'] = "Average Monthly Comsumption is required";
    //     valid = false;
    // }

    var query = "SELECT * from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + req.body.generic_name + "' AND BRAND_NAME = '" + req.body.brand_name + "' AND FORM = '" + req.body.form + "' AND STRENGTH = '" + req.body.strength + "' AND STRENGTH_UNIT = '" + req.body.strength_unit + "' AND MANUFACTURER = '" + req.body.manufacturer + "';";           
    var medicineResult = dbQuerySync(query);
    if(medicineResult.length != 0)
    {
        if(valid)
        {   
            var query = "SELECT * FROM DASH5082.STOCK_LIST WHERE MEDICINE_ID = " + medicineResult[0].ID + " AND PHARMACY_ID = " + req.session.user_id;
            var stockListResult = dbQuerySync(query);
            if(stockListResult.length != 0)
            {
                jsonObj['generic_name_error'] = "This Medicine is already exists in your stock"
                valid = false;
                jsonObj['message'] = "failed";
                res.send(jsonObj);
            }
            else
            {
                if(medicineResult[0].SRA == 'NULL')
                {
                    var query = "INSERT INTO DASH5082.STOCK_LIST (MEDICINE_ID, BATCH_NUMBER, EXPIRY_DATE, APPROVAL, PACK_SIZE, PRICE_PER_PACK, AVAILABLE_STOCK, AVG_MONTHLY_CONSUMPTION, PHARMACY_ID, LAST_UPDATE) VALUES (" + medicineResult[0].ID + ",'" + req.body.batch_number + "', '" + req.body.expiry_date + "', '0','" + req.body.pack_size + "','" + req.body.price + "','" + req.body.quantity + "', '" + req.body.avg_monthly_consumption + "', " + req.session.user_id + ",  TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));"; 
                    dbQuerySync(query);
                }
                else
                {
                    var query = "INSERT INTO DASH5082.STOCK_LIST (MEDICINE_ID, BATCH_NUMBER, EXPIRY_DATE, APPROVAL, PACK_SIZE, PRICE_PER_PACK, AVAILABLE_STOCK, AVG_MONTHLY_CONSUMPTION, PHARMACY_ID, LAST_UPDATE) VALUES (" + medicineResult[0].ID + ",'" + req.body.batch_number + "', '" + req.body.expiry_date + "', '1','" + req.body.pack_size + "','" + req.body.price + "','" + req.body.quantity + "', '" + req.body.avg_monthly_consumption + "', " + req.session.user_id + ",  TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));"; 
                    dbQuerySync(query);
                }
                jsonObj['message'] = "success";
                res.send(jsonObj);
            } 
        }
        else
        {
            jsonObj['message'] = "failed";
            res.send(jsonObj);
        }
    }
    else    
    {
        if(valid)
        {    
            var query = "INSERT INTO DASH5082.MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, MANUFACTURER, SRA) VALUES ('" + req.body.generic_name + "','" + req.body.brand_name + "','" + req.body.form + "','" + req.body.strength + "','" + req.body.strength_unit + "','" + req.body.manufacturer + "', NULL);"; 
            dbQuerySync(query);

            var query = "SELECT ID from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + req.body.generic_name + "' AND BRAND_NAME = '" + req.body.brand_name + "' AND FORM = '" + req.body.form + "' AND STRENGTH = '" + req.body.strength + "' AND STRENGTH_UNIT = '" + req.body.strength_unit + "' AND MANUFACTURER = '" + req.body.manufacturer + "';";           
            var medicineIdResult = dbQuerySync(query);

            var query = "INSERT INTO DASH5082.STOCK_LIST (MEDICINE_ID, BATCH_NUMBER, EXPIRY_DATE, APPROVAL, PACK_SIZE, PRICE_PER_PACK, AVAILABLE_STOCK, AVG_MONTHLY_CONSUMPTION, PHARMACY_ID, LAST_UPDATE) VALUES (" + medicineIdResult[0].ID + ",'" + req.body.batch_number + "', '" + req.body.expiry_date + "', '0','" + req.body.pack_size + "','" + req.body.price + "','" + req.body.quantity + "', '" + req.body.avg_monthly_consumption + "', " + req.session.user_id + ",  TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));"; 
            dbQuerySync(query);

            jsonObj['message'] = "success";
            res.send(jsonObj);
        }
        else
        {
            jsonObj['message'] = "failed";
            res.send(jsonObj);
        }
    }                  
});

app.post('/pharmacy/addnewapprovedmedicine', function(req, res){
    var jsonObj = {};
    var valid = true;

    //validate type
    if(!req.body.medicine)
    {
        jsonObj['medicine_error'] = "Medicine is required";
        valid = false;
    }

    if(!req.body.batch_number)
    {
        jsonObj['batch_number_error'] = "Batch Number is required";
        valid = false;
    }

    if(!req.body.expiry_date)
    {
        jsonObj['expiry_date_error'] = "Expiry Date is required";
        valid = false;
    }

    // if(!req.body.sra)
    // {
    //     jsonObj['sra_error'] = "SRA is required";
    //     valid = false;
    // }

    if(!req.body.pack_size)
    {
        jsonObj['pack_size_error'] = "Pack Size is required";
        valid = false;
    }

    if(!req.body.price)
    {
        jsonObj['price_error'] = "Price per Pack is required";
        valid = false;
    }

    if(!req.body.quantity)
    {
        jsonObj['quantity_error'] = "Quantity is required";
        valid = false;
    }

    // if(!req.body.avg_monthly_consumption)
    // {
    //     jsonObj['avg_monthly_consumption_error'] = "Average Monthly Comsumption is required";
    //     valid = false;
    // }
    console.log(req.body);
    
    if(valid)
    {
        var query = "SELECT * FROM DASH5082.STOCK_LIST WHERE MEDICINE_ID = " + req.body.medicine + " AND PHARMACY_ID = " + req.session.user_id;
        console.log(query);
        var stockListResult = dbQuerySync(query);
        if(stockListResult.length != 0)
        {
            jsonObj['medicine_error'] = "This Medicine is already exists in your stock"
            valid = false;
            jsonObj['message'] = "failed";
            res.send(jsonObj);
        }
        else
        {
            var query = "INSERT INTO DASH5082.STOCK_LIST (MEDICINE_ID, BATCH_NUMBER, EXPIRY_DATE, APPROVAL, PACK_SIZE, PRICE_PER_PACK, AVAILABLE_STOCK, AVG_MONTHLY_CONSUMPTION, PHARMACY_ID, LAST_UPDATE) VALUES (" + req.body.medicine + ",'" + req.body.batch_number + "', '" + req.body.expiry_date + "', '1','" + req.body.pack_size + "','" + req.body.price + "','" + req.body.quantity + "', '" + req.body.avg_monthly_consumption + "', " + req.session.user_id + ",  TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));"; 
            dbQuerySync(query);
            jsonObj['message'] = "success";
            res.send(jsonObj);
        }
    }
    else
    {
        jsonObj['message'] = "failed";
        res.send(jsonObj);
    }                  
});

app.post('/pharmacy/updatemedicine', function(req, res){
    var jsonObj = {};
    var valid = true;

    // if(!req.body.medicine)
    // {
    //     jsonObj['medicine_error'] = "Medicine is required";
    //     valid = false;
    // }

    if(!req.body.batch_number)
    {
        jsonObj['batch_number_error'] = "Batch Number is required";
        valid = false;
    }

    if(!req.body.expiry_date)
    {
        jsonObj['expiry_date_error'] = "Expiry Date is required";
        valid = false;
    }

    // if(!req.body.sra)
    // {
    //     jsonObj['sra_error'] = "SRA is required";
    //     valid = false;
    // }

    if(!req.body.pack_size)
    {
        jsonObj['pack_size_error'] = "Pack Size is required";
        valid = false;
    }

    if(!req.body.price)
    {
        jsonObj['price_error'] = "Price per Pack is required";
        valid = false;
    }

    if(!req.body.quantity)
    {
        jsonObj['quantity_error'] = "Quantity is required";
        valid = false;
    }

    // if(!req.body.avg_monthly_consumption)
    // {
    //     jsonObj['avg_monthly_consumption_error'] = "Average Monthly Comsumption is required";
    //     valid = false;
    // }
    console.log(req.body);
    
    if(valid)
    {
        var query = "SELECT * FROM DASH5082.STOCK_LIST WHERE ID =" + req.body.stock_id + " AND PHARMACY_ID =" + req.session.user_id;
        console.log(query);
        var stockListResult = dbQuerySync(query);
        
        if(stockListResult.length == 0)
        {
            jsonObj['batch_number_error'] = "This Medicine is not exists in your stock"
            valid = false;
            jsonObj['message'] = "failed";
            res.send(jsonObj);
        }
        else
        {
            var query = "UPDATE DASH5082.STOCK_LIST SET BATCH_NUMBER = '" + req.body.batch_number + "', EXPIRY_DATE = '" + req.body.expiry_date + "', PACK_SIZE = '" + req.body.pack_size + "', PRICE_PER_PACK = '" + req.body.price + "', AVAILABLE_STOCK = '" + req.body.quantity + "', AVG_MONTHLY_CONSUMPTION = '" + req.body.avg_monthly_consumption + "', LAST_UPDATE = CURRENT_TIMESTAMP WHERE ID =" + req.body.stock_id + " AND PHARMACY_ID =" + req.session.user_id; 
            dbQuerySync(query);
            jsonObj['message'] = "success";
            res.send(jsonObj);
        }
    }
    else
    {
        jsonObj['message'] = "failed";
        res.send(jsonObj);
    }                  
});

app.post('/pharmacy/deletemedicine', function(req, res){
    var jsonObj = {};
    var valid = true;

    if(!req.body.stock_id)
    {
        jsonObj['medicine_error'] = "Medicine is required";
        valid = false;
    }

    console.log(req.body);
    
    if(valid)
    {
        var query = "SELECT * FROM DASH5082.STOCK_LIST WHERE ID =" + req.body.stock_id + " AND PHARMACY_ID =" + req.session.user_id;
        console.log(query);
        var stockListResult = dbQuerySync(query);
        
        if(stockListResult.length == 0)
        {
            jsonObj['medicine_error'] = "This Medicine is not exists in your stock"
            valid = false;
            jsonObj['message'] = "failed";
            res.send(jsonObj);
        }
        else
        {
            var query = "DELETE FROM DASH5082.STOCK_LIST WHERE ID =" + req.body.stock_id + " AND PHARMACY_ID =" + req.session.user_id; 
            dbQuerySync(query);
            jsonObj['message'] = "success";
            res.send(jsonObj);
        }
    }
    else
    {
        jsonObj['message'] = "failed";
        res.send(jsonObj);
    }                  
});

app.post('/admin/deletemedicine', function(req, res){
    var jsonObj = {};
    var valid = true;

    if(!req.body.medicine_id)
    {
        jsonObj['medicine_error'] = "Medicine is required";
        valid = false;
    }

    console.log(req.body);
    
    if(valid)
    {
        var query = "SELECT * FROM DASH5082.MEDICINE WHERE ID =" + req.body.medicine_id;
        console.log(query);
        var result = dbQuerySync(query);
        
        if(result.length == 0)
        {
            jsonObj['medicine_error'] = "This is not a valid medicine"
            valid = false;
            jsonObj['message'] = "failed";
            res.send(jsonObj);
        }
        else
        {
            var query = "DELETE FROM DASH5082.MEDICINE WHERE ID =" + req.body.medicine_id; 
            dbQuerySync(query);
            jsonObj['message'] = "success";
            res.send(jsonObj);
        }
    }
    else
    {
        jsonObj['message'] = "failed";
        res.send(jsonObj);
    }                  
});

app.post('/admin/uploadstocklist', function(req, res) {
    var sampleFile;
 
    if (!req.files) {
        res.send('No files were uploaded.');
        console.log('No files were uploaded.');
        return;
    }
    sampleFile = req.files.sampleFile;
    var fileArray = sampleFile.name.split('.');
    var extension = fileArray[fileArray.length - 1];
    if(extension == "xlsx")
    {
        sampleFile.mv('./public/downloads/stocklist_example_data.xlsx', function(err) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                req.session.success_message = '<div class="alert alert-success message-form"> The file is uploaded successfuly</div>'
                res.redirect('/admin/manage_medicines');
                console.log('File uploaded!');
            }
        });
    }
    else
    {
        req.session.extention_error = true;
        res.redirect('/admin/manage_medicines');
    }
});

app.post('/pharmacy/uploadstocklist', checkSignIn, function(req, res) {
    var sampleFile;
 
    if (!req.files) {
        res.send('No files were uploaded.');
        console.log('No files were uploaded.');
        return;
    }
    sampleFile = req.files.sampleFile;
    var fileArray = sampleFile.name.split('.');
    var extension = fileArray[fileArray.length - 1];
    if(extension == "xlsx")
    {
        sampleFile.mv('./public/uploads/stocks/stock_list_' + req.session.user_id + '.xlsx', function(err) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                parsingStockList(req, function() {
                  res.redirect('/pharmacy');
                });
                // res.redirect('/admin/uploadmedicines');
                console.log('File uploaded!');
            }
        });
    }
    else
    {
        req.session.extention_error = true;
        res.redirect('/pharmacy');
    }
});

app.use('/pharmacy/uploadstocklist', function(err, req, res, next){
console.log(err);
    if(err == "Error: First Login")
    {
        res.redirect('/user/first_changepassword');
    }
    else
    {
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
    }
});

function parsingStockList(req, callback) {
    var workbook = XLSX.readFile('./public/uploads/stocks/stock_list_' + req.session.user_id + '.xlsx');
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];

    var warning_message = "<div class='alert alert-danger error-form'> Some medicines cannot be added due to the following: <ul>";
    var flag = true;
    var format_error_flag = false;
    var i = 2;
    while(flag)
    {
        var wm = "<li> On line " + i + ":";
        var id, generic_name, form, strength, strength_unit, brand_name, manufacturer, batch_number, expiry_date, sra, pack_size, price, quantity, avg_monthly_consumption;

        var id_address = 'A'+i;
        var id_cell = worksheet[id_address];
        
        if(id_cell == undefined)
        {
            flag = false;
            warning_message = warning_message + '</ul></div>';
            if(format_error_flag)
            {
                req.session.format_error = warning_message;
            }
            callback();//res.redirect('/admin/uploadmedicines');
            break;
        }
        else
        {
            id = id_cell.v;
        }

        var generic_name_address = 'B'+i;
        var generic_name_cell = worksheet[generic_name_address];
        if(generic_name_cell != undefined)
        {
            generic_name = generic_name_cell.v;
        }
        else
        {
            generic_name = '';
        }

        var form_address = 'C'+i;
        var form_cell = worksheet[form_address];
        if(form_cell != undefined)
        {
            form = form_cell.v;
        }
        else
        {
            form = '';
        }

        var strength_address = 'D'+i;
        var strength_cell = worksheet[strength_address];
        if(strength_cell != undefined)
        {
            strength = strength_cell.v;
        }
        else
        {
            strength = '';
        }
        
        var strength_unit_address = 'E'+i;
        var strength_unit_cell = worksheet[strength_unit_address];
        if(strength_unit_cell != undefined)
        {
            strength_unit = strength_unit_cell.v;
        }
        else
        {
            strength_unit = '';
        }

        var brand_name_address = 'F'+i;
        var brand_name_cell = worksheet[brand_name_address];
        if(brand_name_cell != undefined)
        {
            brand_name = brand_name_cell.v;
        }
        else
        {
            brand_name = '';
        }

        var manufacturer_address = 'G'+i;
        var manufacturer_cell = worksheet[manufacturer_address];
        if(manufacturer_cell != undefined)
        {
            manufacturer = manufacturer_cell.v;
        }
        else
        {
            manufacturer = '';
        }

        var batch_number_address = 'H'+i;
        var batch_number_cell = worksheet[batch_number_address];
        if(batch_number_cell != undefined)
        {
            batch_number = batch_number_cell.v;
        }
        else
        {
            batch_number = '';
        }

        var expiry_date_address = 'I'+i;
        var expiry_date_cell = worksheet[expiry_date_address];
        if(expiry_date_cell != undefined)
        {
            expiry_date = "'" +expiry_date_cell.w + "'";
        }
        else
        {
            expiry_date = 'NULL';
        }

        var sra_address = 'J'+i;
        var sra_cell = worksheet[sra_address];
        if(sra_cell != undefined)
        {
            sra = sra_cell.v;
        }
        else
        {
            sra = '';
        }

        var pack_size_address = 'K'+i;
        var pack_size_cell = worksheet[pack_size_address];
        if(pack_size_cell != undefined)
        {
            pack_size = pack_size_cell.v;
        }
        else
        {
            pack_size = '';
        }

        var price_address = 'L'+i;
        var price_cell = worksheet[price_address];
        if(price_cell != undefined)
        {
            price = price_cell.v;
        }
        else
        {
            price = '';
        }

        var quantity_address = 'M'+i;
        var quantity_cell = worksheet[quantity_address];
        if(quantity_cell != undefined)
        {
            quantity = quantity_cell.v;
        }
        else
        {
            quantity = '';
        }

        var avg_monthly_consumption_address = 'N'+i;
        var avg_monthly_consumption_cell = worksheet[avg_monthly_consumption_address];
        if(avg_monthly_consumption_cell != undefined)
        {
            avg_monthly_consumption = avg_monthly_consumption_cell.v;
        }
        else
        {
            avg_monthly_consumption = '';
        }

        var jsonObj = {};
        var valid = true;

        //validate generic name
        if(!generic_name)
        {
            jsonObj['generic_name_error'] = "Generic Name is required";
            wm = wm + 'generic name is required, ';
            valid = false;
        }

        //validate name
        if(!form)
        {
            jsonObj['form_error'] = "Form is required";
            wm = wm + 'form is required, ';
            valid = false;
        }

        //validate type
        if(!strength)
        {
            jsonObj['strength_error'] = "Strength is required";
            wm = wm + 'strength is required, ';
            valid = false;
        }

        //validate type
        if(!strength_unit)
        {
            jsonObj['strength_unit_error'] = "Strength Unit is required";
            wm = wm + 'strength unit is required, ';
            valid = false;
        }

        //validate brand name
        if(!brand_name)
        {
            jsonObj['brand_name_error'] = "Brand Name is required";
            wm = wm + 'brand name is required, ';
            valid = false;
        }

        //validate type
        if(!manufacturer)
        {
            jsonObj['manufacturer_error'] = "Manufacturer is required";
            wm = wm + 'manufacture is required, ';
            valid = false;
        }

        if(!batch_number)
        {
            jsonObj['batch_number_error'] = "Batch Number is required";
            wm = wm + 'batch number is required, ';
            valid = false;
        }

        if(!expiry_date)
        {
            jsonObj['expiry_date_error'] = "Expiry Date is required";
            wm = wm + 'expiry date is required, ';
            valid = false;
        }

        // if(!sra)
        // {
        //     jsonObj['sra_error'] = "SRA is required";
        //     valid = false;
        // }

        if(!pack_size)
        {
            jsonObj['pack_size_error'] = "Pack Size is required";
            wm = wm + 'pack size is required, ';
            valid = false;
        }

        if(!price)
        {
            jsonObj['price_error'] = "Price per Pack is required";
            wm = wm + 'price is required, ';
            valid = false;
        }

        if(!quantity)
        {
            jsonObj['quantity_error'] = "Quantity is required";
            wm = wm + 'available in stock is required, ';
            valid = false;
        }

        ////////////////////////////////////////////
        var query = "SELECT * from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + generic_name + "' AND BRAND_NAME = '" + brand_name + "' AND FORM = '" + form + "' AND STRENGTH = '" + strength + "' AND STRENGTH_UNIT = '" + strength_unit + "' AND MANUFACTURER = '" + manufacturer + "';";           
        var medicineResult = dbQuerySync(query);
        if(medicineResult.length != 0)
        {
            if(valid)
            {   
                var approval = 0;
                if(medicineResult[0].SRA != 'NULL')
                {
                    approval = 1;
                }
                var query = "SELECT * FROM DASH5082.STOCK_LIST WHERE MEDICINE_ID =" + medicineResult[0].ID;
                var stockListResult = dbQuerySync(query);
                if(stockListResult.length != 0)
                {
                    var query = "UPDATE DASH5082.STOCK_LIST SET MEDICINE_ID =" + medicineResult[0].ID + ", BATCH_NUMBER ='" + batch_number + "', EXPIRY_DATE = TIMESTAMP_FORMAT(" + expiry_date + ", 'DD-MM-YY'), APPROVAL = '" + approval + "', PACK_SIZE = '" + pack_size + "', PRICE_PER_PACK = '" + price + "', AVAILABLE_STOCK = '" + quantity + "', AVG_MONTHLY_CONSUMPTION = '" + avg_monthly_consumption + "', PHARMACY_ID =" + req.session.user_id + ", LAST_UPDATE = TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS') WHERE ID = " + stockListResult[0].ID + ";";
                    var result = dbQuerySync(query);

                }
                else
                {
                    var query = "INSERT INTO DASH5082.STOCK_LIST (MEDICINE_ID, BATCH_NUMBER, EXPIRY_DATE, APPROVAL, PACK_SIZE, PRICE_PER_PACK, AVAILABLE_STOCK, AVG_MONTHLY_CONSUMPTION, PHARMACY_ID, LAST_UPDATE) VALUES (" + medicineResult[0].ID + ",'" + batch_number + "', TIMESTAMP_FORMAT(" + expiry_date + ", 'DD-MM-YY'), '" + approval + "','" + pack_size + "','" + price + "','" + quantity + "', '" + avg_monthly_consumption + "', " + req.session.user_id + ",  TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));"; 
                    dbQuerySync(query);
                    jsonObj['message'] = "success";
                    // res.send(jsonObj);
                } 
            }
            else
            {
                format_error_flag = true;
                wm = wm.slice(0, -2) + '</li>';
                warning_message = warning_message + wm;
                jsonObj['message'] = "failed";
                // res.send(jsonObj);
            }
        }
        else
        {
            if(valid)
            {    
                var query = "INSERT INTO DASH5082.MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, MANUFACTURER, SRA) VALUES ('" + generic_name + "','" + brand_name + "','" + form + "','" + strength + "','" + strength_unit + "','" + manufacturer + "', NULL);"; 
                dbQuerySync(query);

                var query = "SELECT ID from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + generic_name + "' AND BRAND_NAME = '" + brand_name + "' AND FORM = '" + form + "' AND STRENGTH = '" + strength + "' AND STRENGTH_UNIT = '" + strength_unit + "' AND MANUFACTURER = '" + manufacturer + "';";           
                var medicineIdResult = dbQuerySync(query);

                var query = "INSERT INTO DASH5082.STOCK_LIST (MEDICINE_ID, BATCH_NUMBER, EXPIRY_DATE, APPROVAL, PACK_SIZE, PRICE_PER_PACK, AVAILABLE_STOCK, AVG_MONTHLY_CONSUMPTION, PHARMACY_ID, LAST_UPDATE) VALUES (" + medicineIdResult[0].ID + ",'" + batch_number + "', TIMESTAMP_FORMAT(" + expiry_date + ", 'DD-MM-YY'), '0','" + pack_size + "','" + price + "','" + quantity + "', '" + avg_monthly_consumption + "', " + req.session.user_id + ",  TIMESTAMP_FORMAT('" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 'YYYY-MM-DD HH24:MI:SS'));"; 
                dbQuerySync(query);

                jsonObj['message'] = "success";
                // res.send(jsonObj);
            }
            else
            {
                format_error_flag = true;
                wm = wm.slice(0, -2) + '</li>';
                warning_message = warning_message + wm;
                jsonObj['message'] = "failed";
                // res.send(jsonObj);
            }
        }
        ////////////////////////////////////////////
        console.log(jsonObj);
        console.log(brand_name);
        i++;
    }
}
app.post('/getavailablepharmacies', function(req, res) {
    var valid = true;

    //validate generic name
    if(!req.body.generic_name)
    {
        jsonObj['generic_name_error'] = "Generic Name is required";
        valid = false;
    }

    //validate brand name
    if(!req.body.brand_name)
    {
        jsonObj['brand_name_error'] = "Brand Name is required";
        valid = false;
    }

    //validate name
    if(!req.body.form)
    {
        jsonObj['form_error'] = "Form is required";
        valid = false;
    }

    //validate type
    if(!req.body.strength)
    {
        jsonObj['strength_error'] = "Strength is required";
        valid = false;
    }

    //validate type
    if(!req.body.strength_unit)
    {
        jsonObj['strength_unit_error'] = "Strength Unit is required";
        valid = false;
    }

    //validate type
    if(!req.body.manufacturer)
    {
        jsonObj['manufacturer_error'] = "Manufacturer is required";
        valid = false;
    }

    if(valid) {
        var query = "SELECT * from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + req.body.generic_name + "' AND BRAND_NAME = '" + req.body.brand_name + "' AND FORM = '" + req.body.form + "' AND STRENGTH = '" + req.body.strength + "' AND STRENGTH_UNIT = '" + req.body.strength_unit + "' AND MANUFACTURER = '" + req.body.manufacturer + "';";           
        var medicineResult = dbQuerySync(query);
        console.log(medicineResult[0].ID);
        var query = "SELECT U.ID AS ID, U.EMAIL, U.NAME, U.PHONE_NUMBER, U.STREET, U.CITY, U.STATE, U.ZIP, U.OPEN_FROM, U.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, S.LAST_UPDATE FROM DASH5082.MEDICINE M JOIN STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN USER U ON U.ID = S.PHARMACY_ID WHERE S.APPROVAL ='1' AND M.ID =" + medicineResult[0].ID + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)";
        var pharmacies = dbQuerySync(query);
        var result = {message: "success"};
        result['pharmacies'] = pharmacies; 
        res.send(result);
    }
    else {
        res.send({message: "failed"});
    }
});

app.get('/doctor/choosetreatmentcenter', checkSignIn, function(req, res){
    if(req.param('ids') && req.param('qs'))
    {
        idsArray = req.param('ids').split('-');
        qsArray = req.param('qs').split('-');
        var vaildIds = idsArray.every(function checkInteger(id) { return Number.isInteger(parseInt(id));});
        var vaildQs = qsArray.every(function checkInteger(quantity) { return Number.isInteger(parseInt(quantity));});
        if(idsArray.length > 0 && (idsArray.length == qsArray.length) && vaildIds && vaildQs)
        {
            var medicines = [];
            for (var i = 0; i < idsArray.length; i++) {
                
                var query = "SELECT * FROM DASH5082.MEDICINE WHERE ID =" + parseInt(idsArray[i]); 
                var medicine = dbQuerySync(query);
                if(medicine.length != 0) {
                    var obj = {}
                    obj['quantity'] = qsArray[i];
                    obj['medicine'] = medicine[0];
                    medicines.push(obj);   
                }
            }
            var base = req.protocol + '://' + req.get('host');
            var query = "SELECT * FROM DASH5082.USER WHERE TYPE = 'TREATMENT CENTER'";
            var treatmentCenters = dbQuerySync(query);
            res.render('doctor/choose_treatment_center', { base: base, medicines: medicines, treatmentCenters: treatmentCenters});
        }
        else
        {
            res.send("404 Not Found");
        }
    }
    else
    {
        res.send("404 Not Found");
    }
});

app.post('/doctor/gettreatmentcentermedicines', function(req, res) {
    if(req.param('ids') && req.param('qs'))
    {
        var idsArray = req.param('ids').split('-');
        var qsArray = req.param('qs').split('-');
        var vaildIds = idsArray.every(function checkInteger(id) { return Number.isInteger(parseInt(id));});
        var vaildQs = qsArray.every(function checkInteger(quantity) { return Number.isInteger(parseInt(quantity));});
        if(idsArray.length > 0 && (idsArray.length == qsArray.length) && vaildIds && vaildQs)
        {
            var query = "SELECT * FROM DASH5082.USER WHERE ID =" + req.body.id + " AND TYPE = 'TREATMENT CENTER'"; 
            var treatmentCenter = dbQuerySync(query);
            if(treatmentCenter.length != 0) {
                var medicines = [];
                for (var i = 0; i < idsArray.length; i++) {
                    var query = "SELECT M.GENERIC_NAME, M.BRAND_NAME, M.FORM, M.STRENGTH, M.STRENGTH_UNIT, M.MANUFACTURER, SL.LAST_UPDATE FROM USER U JOIN STOCK_LIST SL ON U.ID = SL.PHARMACY_ID JOIN MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE U.ID =" + req.body.id + " AND M.ID =" + parseInt(idsArray[i]) + " AND SL.AVAILABLE_STOCK >=" + qsArray[i]; 
                    var medicine = dbQuerySync(query);
                    if(medicine.length != 0) {
                        var obj = {}
                        obj['quantity'] = qsArray[i];
                        obj['medicine'] = medicine[0];
                        medicines.push(obj);   
                    }
                }
                res.send({message:'success', treatmentCenter: treatmentCenter, medicines: medicines});
            }
            else {
                res.send({message:'failed'});
            }
        }
        else
        {
            res.send({message:'failed'});
        }
    }
    else
    {
        res.send({message:'failed'});
    }
});

app.get('/doctor/selectpharmacies', function(req, res) {
    if(req.param('ids') && req.param('qs') && req.param('t'))
    {
        var idsArray = req.param('ids').split('-');
        var qsArray = req.param('qs').split('-');
        var treatmentCenter = req.param('t');
        var vaildIds = idsArray.every(function checkInteger(id) { return Number.isInteger(parseInt(id));});
        var vaildQs = qsArray.every(function checkInteger(quantity) { return Number.isInteger(parseInt(quantity));});
        var validTreatmentCenter = Number.isInteger(parseInt(treatmentCenter));
        if(idsArray.length == qsArray.length && vaildIds && vaildQs && validTreatmentCenter)
        {
            var treatmentCenterMedicines = [];
            var missingMedicines = [];
            var medicines = [];
            for (var i = 0; i < idsArray.length; i++) {
                var query = "SELECT * FROM DASH5082.MEDICINE  WHERE ID =" + parseInt(idsArray[i]); 
                var medicine = dbQuerySync(query);
                var obj = {}
                obj['quantity'] = qsArray[i];
                obj['medicine'] = medicine[0];
                medicines.push(obj);
                var query = "SELECT M.GENERIC_NAME, M.BRAND_NAME, M.FORM, M.STRENGTH, M.STRENGTH_UNIT, M.MANUFACTURER, SL.LAST_UPDATE FROM USER U JOIN STOCK_LIST SL ON U.ID = SL.PHARMACY_ID JOIN MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE U.ID =" + treatmentCenter + " AND M.ID =" + parseInt(idsArray[i]) + " AND SL.AVAILABLE_STOCK >=" + qsArray[i]; 
                var treatmentMedicine = dbQuerySync(query);
                if(treatmentMedicine.length != 0) {
                    var obj = {}
                    obj['quantity'] = qsArray[i];
                    obj['medicine'] = treatmentMedicine[0];
                    treatmentCenterMedicines.push(obj);   
                }
                else {
                    var obj = {};
                
                    obj['quantity'] = qsArray[i];
                    obj['medicine'] = medicine[0];
                    var query = "SELECT U.ID AS ID, U.EMAIL, U.NAME, U.PHONE_NUMBER, U.STREET, U.CITY, U.STATE, U.ZIP, U.OPEN_FROM, U.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, S.LAST_UPDATE FROM DASH5082.MEDICINE M JOIN STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN USER U ON U.ID = S.PHARMACY_ID WHERE S.APPROVAL ='1' AND M.ID =" + parseInt(idsArray[i]) + " AND S.AVAILABLE_STOCK >=" + qsArray[i] + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)"; 
                    var pharmacies = dbQuerySync(query);
                    if(pharmacies.length > 0)
                    {
                        obj['pharmacies'] = pharmacies;
                    }
                    missingMedicines.push(obj);
                }
            }
            var base = req.protocol + '://' + req.get('host');
            res.render('doctor/select_pharmacies',{base:base, medicines:medicines, treatmentCenterMedicines: treatmentCenterMedicines, missingMedicines: missingMedicines});
        }
        else 
        {
            res.send("404 Not Found");
        }
    }
    else
    {
        res.send("404 Not Found");
    }
});

app.get('/doctor/shoppinglist', function(req, res) {
    res.send({message: 'success'});
});

app.get('/doctor/getsearchresults', checkSignIn, function(req, res){
    if(req.param('ids') && req.param('qs'))
    {
        var idsArray = req.param('ids').split('-');
        var qsArray = req.param('qs').split('-');
        var vaildIds = idsArray.every(function checkInteger(id) { return Number.isInteger(parseInt(id));});
        var vaildQs = qsArray.every(function checkInteger(quantity) { return Number.isInteger(parseInt(quantity));});
        if(idsArray.length == qsArray.length && vaildIds && vaildQs)
        {
            var medicines = [];
            for (var i = 0; i < idsArray.length; i++) {
                // idsArray[i]
                var obj = {};
                
                obj['quantity'] = qsArray[i];
                var query = "SELECT * FROM DASH5082.MEDICINE  WHERE ID =" + parseInt(idsArray[i]); 
                var medicine = dbQuerySync(query);
                obj['medicine'] = medicine[0];
                var query = "SELECT U.ID AS ID, U.EMAIL, U.NAME, U.PHONE_NUMBER, U.STREET, U.CITY, U.STATE, U.ZIP, U.OPEN_FROM, U.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, S.LAST_UPDATE FROM DASH5082.MEDICINE M JOIN STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN USER U ON U.ID = S.PHARMACY_ID WHERE S.APPROVAL ='1' AND M.ID =" + parseInt(idsArray[i]) + " AND S.AVAILABLE_STOCK >=" + qsArray[i] + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)"; 
                var pharmacies = dbQuerySync(query);
                if(pharmacies.length > 0)
                {
                    obj['pharmacies'] = pharmacies;
                }
                medicines.push(obj);
            }
            //console.log(medicines);
            //get all pharmacies in one array

            var pharmacies = [];
            for (var i = 0; i < medicines.length; i++) {
                if(medicines[i].pharmacies) {
                   pharmacies.push(medicines[i].pharmacies);     
                }
            }

            //console.log(pharmacies);
            //Flatten the stoes array
            var mergedPharmacies = [].concat.apply([], pharmacies);
            //console.log(mergedPharmacies);
            //remove the duplicates in the pharmacies array

            var flags = {};
            var uniquePharmacies = mergedPharmacies.filter(function(entry) {
                if (flags[entry.ID]) {
                    return false;
                }
                flags[entry.ID] = true;
                return true;
            });

            //unify medicines by creating a new copy and removing the pharmacies from the new one to avoid circular references

            var newMedicines = JSON.parse(JSON.stringify(medicines));

            for(var i=0; i< newMedicines.length;i++) {
                delete newMedicines[i].pharmacies;
            }

            //get the medicines available in each pharmacy and insert them in the pharmacies array

            for(var i=0;i< uniquePharmacies.length;i++){
                var pharmacyMedicines = [];
                var total = 0;
                for(var j=0; j< medicines.length;j++) {
                    if(medicines[j].pharmacies){
                        if(containsMatchingIds(medicines[j].pharmacies, uniquePharmacies[i]) ) {
                            var price = getStockPrice(uniquePharmacies[i].ID, medicines[j].pharmacies);
                            console.log(price);
                            console.log(medicines[j].pharmacies);
                            pharmacyMedicines.push(newMedicines[j]);
                            // console.log(medicines[j].pharmacies);
                            total = total + (parseInt(price)* medicines[j].quantity);
                        }
                    }    
                }
                uniquePharmacies[i]['totalPrice'] = total;
                uniquePharmacies[i]['medicines'] = pharmacyMedicines;
            }

            var fullPharmacies = uniquePharmacies.filter(function(pharmacy){
                return medicines.length == pharmacy.medicines.length
            });

            var sortedPharmacies = fullPharmacies.sort(function(a, b){
                return a.totalPrice - b.totalPrice;
            });

            console.log(sortedPharmacies);
            var base = req.protocol + '://' + req.get('host');
            res.render('doctor/search_results', { base: base, medicines: medicines, pharmacies: sortedPharmacies});
            // res.send({ids: req.param('ids'), qs: req.param('qs')});
        }
        else
        {
            res.send("404 Not Found");
        }
    }
    else
    {
        res.send("404 Not Found");
    }
});

function containsMatchingIds(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i].ID === obj.ID) {
            return true;
        }
    }
    return false;
}

function getStockPrice(pharmacyId, pharmacies) {
    for (var i = 0; i < pharmacies.length; i++) {
        if(pharmacies[i].ID == pharmacyId){
            return pharmacies[i].PRICE_PER_PACK;
        }
    }
}

app.use('/doctor/getsearchresults', function(err, req, res, next){
console.log(err);
    if(err == "Error: First Login")
    {
        res.redirect('/user/first_changepassword');
    }
    else
    {
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
    }
});

app.post('/doctor/updateprofile', function(req, res){
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
    
    //validate name
    if(!req.body.name)
    {
        jsonObj['name_error'] = "Name is required";
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

    var query = "SELECT * from DASH5082.USER WHERE EMAIL ='" + req.body.email + "';";           
        
    var result = dbQuery(query, function(result) {
        console.log(result);
        if(result.length != 0 && result[0].ID != req.session.user_id)
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
                query = "UPDATE DASH5082.USER SET EMAIL='" + req.body.email + "', NAME ='" + req.body.name + "', STREET ='" + req.body.street + "', CITY ='" + req.body.city + "', STATE ='" + req.body.state + "', ZIP ='" + req.body.zip + "' WHERE ID =" + req.session.user_id;
                
                dbQuery(query, function(newResult) {
                    jsonObj['message'] = "success";
                    res.send(jsonObj);
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

app.post('/pharmacy/updateprofile', function(req, res){
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
    
    //validate name
    if(!req.body.name)
    {
        jsonObj['name_error'] = "Name is required";
        valid = false;
    }

    //validate street
    if(!req.body.street)
    {
        jsonObj['street_error'] = "Street is required";
        valid = false;
    }

    //validate city
    if(!req.body.city)
    {
        jsonObj['city_error'] = "City is required";
        valid = false;
    }

    //validate state
    if(!req.body.state)
    {
        jsonObj['state_error'] = "State is required";
        valid = false;
    }

    //validate zip
    if(!req.body.zip)
    {
        jsonObj['zip_error'] = "Zip Code is required";
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

    var query = "SELECT * from DASH5082.USER WHERE EMAIL ='" + req.body.email + "';";           
        
    var result = dbQuery(query, function(result) {
        console.log(result);
        if(result.length != 0 && result[0].ID != req.session.user_id)
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
                query = "UPDATE DASH5082.USER SET EMAIL='" + req.body.email + "', NAME ='" + req.body.name + "', STREET ='" + req.body.street + "', CITY ='" + req.body.city + "', STATE ='" + req.body.state + "', ZIP ='" + req.body.zip + "', PHONE_NUMBER ='" + req.body.phone_number + "', OPEN_FROM='" + req.body.open_from + "', OPEN_TO='" + req.body.open_to + "' WHERE ID =" + req.session.user_id;
                
                dbQuery(query, function(newResult) {
                    jsonObj['message'] = "success";
                    res.send(jsonObj);
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

app.post('/user/changepassword', function(req, res){
    var jsonObj = {};
    var valid = true;
    
    //validate old_password
    if(!req.body.old_password)
    {
        jsonObj['old_password_error'] = "Old Password is required";
        valid = false;
    }

    //validate password
    //Minimum 8 characters at least 1 special character
    var passwordRegex = /^(?=.*[A-Za-z\d])(?=.*[$@$!%*#?&\^\\\/"'<>;:+\-()_~{}\[\]=])[A-Za-z\d$@$!%*#?&\^\\\/"'<>;:+\-()_~{}\[\]=]{8,}$/;
    if(!req.body.new_password)
    {
        jsonObj['new_password_error'] = "New Password is required";
        valid = false;
    }
    else if(!validateWithRegex(passwordRegex, req.body.new_password))
    {
       jsonObj['new_password_error'] = "Password has to be minimum 8 characters at least 1 special character";
       valid = false;
    }
    else if(req.body.new_password != req.body.rnew_password)
    {
       jsonObj['new_password_error'] = "Password and cofirm password doesn't match";   
       valid = false;
    }

    //validate rnew_password
    if(!req.body.rnew_password)
    {
        jsonObj['rnew_password_error'] = "Confirm New Password is required";
        valid = false;
    }
    if(valid)
    {   var query = "SELECT * FROM DASH5082.USER WHERE ID =" + req.session.user_id + ";";
        dbQuery(query, function(result) {
            console.log(result);
            bcrypt.compare(req.body.old_password, result[0].PASSWORD, function(err, cmp) {
                // res == true
                if(cmp)
                {
                    bcrypt.hash(req.body.new_password, saltRounds, function(err, hash) {
                      // Store hash in your password DB.
                      // enter new pharmacy to the db
                      var query = "UPDATE DASH5082.USER SET PASSWORD ='" + hash + "' WHERE ID =" + req.session.user_id + ";";
                      dbQuery(query, function(newResult) {
                          jsonObj['message'] = "success";
                          res.send(jsonObj);
                      });
                    });
                }
                else
                {
                    jsonObj['old_password_error'] = "Wrong Password";
                    jsonObj['message'] = "failed";
                    valid = false;
                    res.send(jsonObj);
                }
            });
        });
    }
    else
    {
        jsonObj['message'] = "failed";
        res.send(jsonObj);
    }        
});

app.post('/pharmacy/getstockrecord', function (req, res) {
    if(req.body.stock_id, Number.isInteger(parseInt(req.body.stock_id))) {
        var query = "SELECT * FROM DASH5082.STOCK_LIST SL JOIN MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE SL.ID =" + req.body.stock_id + " AND SL.PHARMACY_ID =" + req.session.user_id + ";";
        dbQuery(query, function(result) {
            console.log(result);
            if(result.length != 0){
                res.send({message:"success", result:result});
            }
            else{
                res.send({message:"failed"});        
            }       
        });
    }
    else{
        res.send({message:"failed"});
    }
});

function checkSignIn(req, res, next){

    if(req.session.user_id){
        if(req.session.user_first_login == '0')
        {
           next();     //If session exists, proceed to page 
        }
        else
        {
            var err = new Error("First Login");
            next(err);  //Error, trying to access unauthorized page!    
        }
    } else {
        var err = new Error("Not logged in!");
        next(err);  //Error, trying to access unauthorized page!
    }
}

function checkFirstLogin(req, res, next){

    if(req.session.user_id){
        if(req.session.user_first_login == '1')
        {
           next();     //If session exists, proceed to page 
        }
        else
        {
            var err = new Error("Home page");
            next(err);  //Error, trying to access unauthorized page!    
        }
    } else {
        var err = new Error("Not logged in!");
        next(err);  //Error, trying to access unauthorized page!
    }
}

app.get('/protected_page', checkSignIn, function(req, res){
    res.render('protected_page', {name: req.session.user.NAME})
});


app.get('/doctor', checkSignIn, function(req, res){
    // console.log(req.session);
    // req.session.user_id = "1000";
    // console.log(req.session);
    var query = "SELECT * from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
    dbQuery(query, function(result) {
        //console.log(result[0].ID);
        var base = req.protocol + '://' + req.get('host');
        // redirect with data
        //res.send({data: result});
        res.render('doctor/search_medicines', { base: base, medicines:result });  
    });
});

app.use('/doctor', function(err, req, res, next){
console.log(err);
    if(err == "Error: First Login")
    {
        res.redirect('/user/first_changepassword');
    }
    else
    {
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
    }
});


app.get('/user/first_changepassword', checkFirstLogin, function(req, res){
    var base = req.protocol + '://' + req.get('host');
    res.render('user/first_changepassword', { base: base });
});

app.use('/user/first_changepassword', function(err, req, res, next){
console.log(err);
    if(err = "Error: Home page")
    {
        if(req.session.user_type == 'DOCTOR' || req.session.user_type == 'NAVIGATOR'){
            res.redirect('/doctor');
        }
        else
        {
            res.redirect('/pharmacy');
        }
    }
    else if(err = "Error: Not logged in!")
    {
      //User should be authenticated! Redirect him to log in.
        res.redirect('/');  
    }
    
});


app.post('/user/first_changepassword', checkFirstLogin, function(req, res){
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
          var query = "UPDATE DASH5082.USER SET PASSWORD ='" + hash + "', FIRST_LOGIN = '0' WHERE ID =" + req.session.user_id + ";";
          dbQuery(query, function(newResult) {
              req.session.user_first_login = '0';  
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
});

app.get('/doctor/profile', checkSignIn, function(req, res){
    var query = "SELECT * from DASH5082.USER WHERE ID=" + req.session.user_id;
    dbQuery(query, function(result) {
        var base = req.protocol + '://' + req.get('host');
        res.render('doctor/profile', { base: base, info: result });  
    });
});

app.use('/doctor/profile', function(err, req, res, next){
console.log(err);
    if(err == "Error: First Login")
    {
        res.redirect('/user/first_changepassword');
    }
    else
    {
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
    }
});

app.get('/pharmacy/profile', checkSignIn, function(req, res){
    var query = "SELECT * from DASH5082.USER WHERE ID=" + req.session.user_id;
    dbQuery(query, function(result) {
        var base = req.protocol + '://' + req.get('host');
        res.render('pharmacy/profile', { base: base, info: result });  
    });
});

app.use('/pharmacy/profile', function(err, req, res, next){
console.log(err);
    if(err == "Error: First Login")
    {
        res.redirect('/user/first_changepassword');
    }
    else
    {
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
    }
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/');
});

app.get('/admin/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/admin/login');
});

app.use('/protected_page', function(err, req, res, next){
console.log(err);
    //User should be authenticated! Redirect him to log in.
    res.redirect('/login');
});

http.createServer(app).listen(app.get('port'),
 function(){
  console.log('Express server listening on port ' + app.get('port'));
});
