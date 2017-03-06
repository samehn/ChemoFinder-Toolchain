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

function checkAdminSignIn(req, res, next){

    if(req.session.admin_id){
        next();     //If session exists, proceed to page 
    } else {
        var err = new Error("Not logged in!");
        next(err);  //Error, trying to access unauthorized page!
    }
}

function validateWithRegex(regex, email) {
    return regex.test(email);
}

//ADMIN        

function sendEmail(mailOptions) {
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            return 'failed';
            //res.json({message: 'error'});
        }else{
            console.log('Message sent: ' + info.response);
            return 'success';
            //res.json({message: info.response});
        };
    });
}

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

app.get('/doctor/choosetreatmentcenter', checkSignIn, function(req, res){
    if(req.param('ids') && req.param('qs'))
    {
        idsArray = req.param('ids').split('-');
        qsArray = req.param('qs').split('-');
        var validIds = idsArray.every(function checkInteger(id) { return Number.isInteger(parseInt(id));});
        var validQs = qsArray.every(function checkInteger(quantity) { return Number.isInteger(parseInt(quantity));});
        if(idsArray.length > 0 && (idsArray.length == qsArray.length) && validIds && validQs)
        {
            var medicines = [];
            for (var i = 0; i < idsArray.length; i++) {
                
                var query = "SELECT * FROM DASH5082.MEDICINE WHERE ID =" + parseInt(idsArray[i]); 
                var medicine = db.dbQuerySync(query);
                if(medicine.length != 0) {
                    var obj = {}
                    obj['quantity'] = qsArray[i];
                    obj['medicine'] = medicine[0];
                    medicines.push(obj);   
                }
            }
            var base = req.protocol + '://' + req.get('host');
            var query = "SELECT * FROM DASH5082.USER WHERE TYPE = 'TREATMENT CENTER'";
            var treatmentCenters = db.dbQuerySync(query);
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

app.post('/doctor/gettreatmentcentermedicines', checkSignIn, function(req, res) {
    if(req.param('ids') && req.param('qs'))
    {
        var idsArray = req.param('ids').split('-');
        var qsArray = req.param('qs').split('-');
        var validIds = idsArray.every(function checkInteger(id) { return Number.isInteger(parseInt(id));});
        var validQs = qsArray.every(function checkInteger(quantity) { return Number.isInteger(parseInt(quantity));});
        if(idsArray.length > 0 && (idsArray.length == qsArray.length) && validIds && validQs)
        {
            var query = "SELECT * FROM DASH5082.USER WHERE ID =" + req.body.id + " AND TYPE = 'TREATMENT CENTER'"; 
            var treatmentCenter = db.dbQuerySync(query);
            if(treatmentCenter.length != 0) {
                var medicines = [];
                for (var i = 0; i < idsArray.length; i++) {
                    var query = "SELECT M.GENERIC_NAME, M.BRAND_NAME, M.FORM, M.STRENGTH, M.STRENGTH_UNIT, M.MANUFACTURER, SL.LAST_UPDATE FROM USER U JOIN STOCK_LIST SL ON U.ID = SL.PHARMACY_ID JOIN MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE U.ID =" + req.body.id + " AND M.ID =" + parseInt(idsArray[i]) + " AND SL.AVAILABLE_STOCK >=" + qsArray[i]; 
                    var medicine = db.dbQuerySync(query);
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

app.get('/doctor/selectpharmacies', checkSignIn, function(req, res) {
    if(req.param('ids') && req.param('qs') && req.param('t'))
    {
        var idsArray = req.param('ids').split('-');
        var qsArray = req.param('qs').split('-');
        var treatmentCenter = req.param('t');
        var validIds = idsArray.every(function checkInteger(id) { return Number.isInteger(parseInt(id));});
        var validQs = qsArray.every(function checkInteger(quantity) { return Number.isInteger(parseInt(quantity));});
        var validTreatmentCenter = Number.isInteger(parseInt(treatmentCenter));
        if(idsArray.length == qsArray.length && validIds && validQs && validTreatmentCenter)
        {
            var treatmentCenterMedicines = [];
            var missingMedicines = [];
            var medicines = [];
            for (var i = 0; i < idsArray.length; i++) {
                var query = "SELECT * FROM DASH5082.MEDICINE  WHERE ID =" + parseInt(idsArray[i]); 
                var medicine = db.dbQuerySync(query);
                var obj = {}
                obj['quantity'] = qsArray[i];
                obj['medicine'] = medicine[0];
                medicines.push(obj);
                var query = "SELECT M.GENERIC_NAME, M.BRAND_NAME, M.FORM, M.STRENGTH, M.STRENGTH_UNIT, M.MANUFACTURER, SL.LAST_UPDATE FROM USER U JOIN STOCK_LIST SL ON U.ID = SL.PHARMACY_ID JOIN MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE U.ID =" + treatmentCenter + " AND M.ID =" + parseInt(idsArray[i]) + " AND SL.AVAILABLE_STOCK >=" + qsArray[i]; 
                var treatmentMedicine = db.dbQuerySync(query);
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
                    var query = "SELECT U.ID AS ID, U.EMAIL, U.NAME, U.PHONE_NUMBER, U.STREET, U.CITY, U.STATE, U.ZIP, U.OPEN_FROM, U.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, S.LAST_UPDATE FROM DASH5082.MEDICINE M JOIN STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN USER U ON U.ID = S.PHARMACY_ID WHERE U.TYPE='PHARMACY' AND S.APPROVAL ='1' AND M.ID =" + parseInt(idsArray[i]) + " AND S.AVAILABLE_STOCK >=" + qsArray[i] + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)"; 
                    var pharmacies = db.dbQuerySync(query);
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

// app.get('/doctor/shoppinglist', checkSignIn, function(req, res) {
//     if(req.param('ids') && req.param('qs') && req.param('t'))
//     {
//         var idsArray = req.param('ids').split('-');
//         var qsArray = req.param('qs').split('-');
//         var medicinePharmacyIds =[];
//         var treatmentCenter = req.param('t');

//         var validIds = idsArray.every(function checkInteger(id) { return Number.isInteger(parseInt(id));});
//         var validQs = qsArray.every(function checkInteger(quantity) { return Number.isInteger(parseInt(quantity));});
//         var validTreatmentCenter = Number.isInteger(parseInt(treatmentCenter));
//         var validmedicinePharmacyIds = true;
//         if(req.param('p')) {
//             medicinePharmacyIds = req.param('p').split('-');
//             validmedicinePharmacyIds = medicinePharmacyIds.every(function checkInteger(record) { return Number.isInteger(parseInt(record.split('_')[0])) && Number.isInteger(parseInt(record.split('_')[1]));});
//         }
//         var query = "SELECT * FROM DASH5082.USER  WHERE ID =" + parseInt(treatmentCenter) + " AND TYPE='TREATMENT CENTER'";
//         var treatmentCenterDetails = db.dbQuerySync(query);
//         if(idsArray.length == qsArray.length && validIds && validQs && validTreatmentCenter && validmedicinePharmacyIds) {
//             var medicines = [];
//             var treatmentCenterMedicines = [];
//             var pharmacyDetails = [];
//             for (var i = 0; i < idsArray.length; i++) {
//                 var query = "SELECT * FROM DASH5082.MEDICINE  WHERE ID =" + parseInt(idsArray[i]); 
//                 var medicine = db.dbQuerySync(query);
//                 var obj = {}
//                 obj['quantity'] = qsArray[i];
//                 obj['medicine'] = medicine[0];
//                 medicines.push(obj);
//                 var query = "SELECT M.GENERIC_NAME, M.BRAND_NAME, M.FORM, M.STRENGTH, M.STRENGTH_UNIT, M.MANUFACTURER, SL.PRICE_PER_PACK, SL.EXPIRY_DATE, SL.PACK_SIZE, SL.LAST_UPDATE FROM USER U JOIN STOCK_LIST SL ON U.ID = SL.PHARMACY_ID JOIN MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE U.ID =" + treatmentCenter + " AND M.ID =" + parseInt(idsArray[i]) + " AND SL.AVAILABLE_STOCK >=" + qsArray[i]; 
//                 var treatmentMedicine = db.dbQuerySync(query);
//                 if(treatmentMedicine.length != 0) {
//                     var obj = {}
//                     obj['quantity'] = qsArray[i];
//                     obj['medicine'] = treatmentMedicine[0];
//                     treatmentCenterMedicines.push(obj);   
//                 }
//             }
//             for (var i = 0; i < medicinePharmacyIds.length; i++) {
//                 var medicineId = medicinePharmacyIds[i].split('_')[0];
//                 var pharmacyId = medicinePharmacyIds[i].split('_')[1];
//                 var query = "SELECT M.GENERIC_NAME, M.BRAND_NAME, M.FORM, M.STRENGTH, M.STRENGTH_UNIT, M.MANUFACTURER, U.EMAIL, U.NAME, U.PHONE_NUMBER, U.STREET, U.CITY, U.STATE, U.ZIP, U.OPEN_FROM, U.OPEN_TO, SL.PRICE_PER_PACK, SL.EXPIRY_DATE, SL.PACK_SIZE, SL.LAST_UPDATE FROM USER U JOIN STOCK_LIST SL ON U.ID = SL.PHARMACY_ID JOIN MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE U.ID =" + pharmacyId + " AND M.ID =" + medicineId;
//                 var pharmacy = db.dbQuerySync(query);
//                 if(pharmacy.length != 0) {
//                     var obj = {};
//                     obj['details'] = pharmacy[0];
//                     pharmacyDetails.push(obj);   
//                 }
//             }
//             var base = req.protocol + '://' + req.get('host');
//             res.render('doctor/shopping_list',{base:base, medicines:medicines, treatmentCenterDetails: treatmentCenterDetails[0], treatmentCenterMedicines: treatmentCenterMedicines, pharmacyDetails: pharmacyDetails});  
//         }
//         else
//         {
//             res.send("404 Not Found");
//         }
//     }
//     else 
//     {
//         res.send("404 Not Found");
//     }    
// });

app.get('/doctor/getsearchresults', checkSignIn, function(req, res){
    if(req.param('ids') && req.param('qs'))
    {
        var idsArray = req.param('ids').split('-');
        var qsArray = req.param('qs').split('-');
        var validIds = idsArray.every(function checkInteger(id) { return Number.isInteger(parseInt(id));});
        var validQs = qsArray.every(function checkInteger(quantity) { return Number.isInteger(parseInt(quantity));});
        if(idsArray.length == qsArray.length && validIds && validQs)
        {
            var medicines = [];
            for (var i = 0; i < idsArray.length; i++) {
                // idsArray[i]
                var obj = {};
                
                obj['quantity'] = qsArray[i];
                var query = "SELECT * FROM DASH5082.MEDICINE  WHERE ID =" + parseInt(idsArray[i]); 
                var medicine = db.dbQuerySync(query);
                obj['medicine'] = medicine[0];
                var query = "SELECT U.ID AS ID, U.EMAIL, U.NAME, U.PHONE_NUMBER, U.STREET, U.CITY, U.STATE, U.ZIP, U.OPEN_FROM, U.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, S.LAST_UPDATE FROM DASH5082.MEDICINE M JOIN STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN USER U ON U.ID = S.PHARMACY_ID WHERE S.APPROVAL ='1' AND M.ID =" + parseInt(idsArray[i]) + " AND S.AVAILABLE_STOCK >=" + qsArray[i] + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)"; 
                var pharmacies = db.dbQuerySync(query);
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


// app.get('/doctor', checkSignIn, function(req, res){    
//     var query = "SELECT * from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
//     db.dbQuery(query, function(result) {
//         var base = req.protocol + '://' + req.get('host');
//         res.render('doctor/search_medicines', { base: base, medicines:result });  
//     });
// });

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

app.use('/protected_page', function(err, req, res, next){
console.log(err);
    //User should be authenticated! Redirect him to log in.
    res.redirect('/login');
});

app.use('/admin/*', function(err, req, res, next){
console.log(err);
    //User should be authenticated! Redirect him to log in.
    res.redirect('/admin/login');
});

http.createServer(app).listen(app.get('port'),
 function(){
  console.log('Express server listening on port ' + app.get('port'));
});
