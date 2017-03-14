controller 					= require('../controller');

function authentication(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    user_pharmacy_model = require('../../models/user_pharmacy_model');
};
authentication.prototype.constructor = authentication;


authentication.prototype.login =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = login_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed', login_error:"Please enter both email and password"});
        res.send(result);
    }
    else {
        tomodel.email = data.email;
        var user =  user_model.select_user_by_email(tomodel);
        if(user.length > 0)
        {
            controller.bcrypt.compare(data.password, user[0].PASSWORD, function(err, cmp) {
                // res == true
                if(cmp)
                {
                    if(user[0].APPROVE == '0')
                    {
                        res.send({message: "failed", login_error: "Your account is not approved yet"});
                    }
                    else if(user[0].ACTIVE == '0')
                    {
                        res.send({message: "failed", login_error: "Your account is suspended"});
                    }
                    else
                    {
                        if(user[0].TYPE.toLowerCase() == 'doctor' || user[0].TYPE.toLowerCase() == 'navigator') {
                            req.session.doctor_id = user[0].ID;
                            req.session.doctor_first_login = user[0].FIRST_LOGIN;
                        }
                        else if(user[0].TYPE.toLowerCase() == 'pharmacy' || user[0].TYPE.toLowerCase() == 'treatment center') {
                            req.session.pharmacy_id = user[0].ID;
                            req.session.pharmacy_first_login = user[0].FIRST_LOGIN;
                        }
                        
                        var type = user[0].TYPE;
                        
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
        
    }
}

authentication.prototype.logout =  function(req, res) {
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/');
}

authentication.prototype.signup =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = register_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else
    {    
        controller.bcrypt.hash(data.password, controller.saltRounds, function(err, hash) {
            tomodel.type = data.type;
            tomodel.name = data.name;
            tomodel.position = data.position;
            tomodel.entity_name = data.entity_name;
            tomodel.phone_number = data.phone_number;
            tomodel.address = data.address;
            tomodel.city = data.city;
            tomodel.country = data.country;

            tomodel.email = data.email;
            tomodel.password = hash;
            
            tomodel.first_login = '0';
            tomodel.active = '1';
            tomodel.approve = '0';
            user_model.insert_user(tomodel);
            var user = user_model.select_user_by_email(tomodel);
            if(data.type == 'pharmacy' || data.type == 'treatment center') {
                tomodel.user_id = user[0].ID;
                tomodel.open_from = data.open_from;
                tomodel.open_to = data.open_to;
                if(!data.open_from || !data.open_to) {
                    tomodel.open_from = '12:00:00';
                    tomodel.open_to = '12:00:00';
                }
                //insert new pharmacy
                user_pharmacy_model.insert_user_pharmacy(tomodel);
            }
            

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
            controller.sendEmail(mailOptions);
            res.send({message: "success"});
        });
    }

}

function login_validations(data) {
    var validation_array = {};
    console.log(data);
    var email = controller.validate({email: data.email},['required']);
    if(email){
        validation_array = controller.mergeArrays(validation_array, email);
    }
    var password = controller.validate({password: data.password},['required']);
    if(password){
        validation_array = controller.mergeArrays(validation_array, password);
    }
    return validation_array;
}

function register_validations(data) {
    var validation_array = {};

    var type = controller.validate({type: data.type},['required']);
    if(type){
        validation_array = controller.mergeArrays(validation_array, type);
    }
    else {
       var types = ['pharmacy', 'treatment center', 'doctor', 'navigator'];
       if(!types.includes(data.type)) {
            validation_array = controller.mergeArrays(validation_array, {type_error: 'This is not a valid type'});       
       } 
    }

    var name = controller.validate({name: data.name},['required', 'length:0-60']);
    if(name){
        validation_array = controller.mergeArrays(validation_array, name);
    }

    var position = controller.validate({position: data.position},['required', 'length:0-60']);
    if(position){
        validation_array = controller.mergeArrays(validation_array, position);
    }

    var entity_name = controller.validate({entity_name: data.entity_name},['required', 'length:0-60']);
    if(entity_name){
        validation_array = controller.mergeArrays(validation_array, entity_name);
    }

    var phone_number = controller.validate({phone_number: data.phone_number},['required', 'integer', 'length:4-23']);
    if(phone_number){
        validation_array = controller.mergeArrays(validation_array, phone_number);
    }

    var address = controller.validate({address: data.address},['required', 'length:0-1000']);
    if(address){
        validation_array = controller.mergeArrays(validation_array, address);
    }

    var city = controller.validate({city: data.city},['required', 'length:0-60']);
    if(city){
        validation_array = controller.mergeArrays(validation_array, city);
    }

    var country = controller.validate({country: data.country},['required', 'length:0-60']);
    if(country){
        validation_array = controller.mergeArrays(validation_array, country);
    }

    var email = controller.validate({email: data.email},['required', 'email', 'length:0-60']);
    if(email){
        validation_array = controller.mergeArrays(validation_array, email);
    }
    else {
        tomodel.email = data.email;
        var user =  user_model.select_user_by_email(tomodel);
        if(user.length > 0) {
            validation_array = controller.mergeArrays(validation_array, {email_error: 'This email is already registered'});
        }
    }

    var password = controller.validate({password: data.password},['required', 'length:8-200', 'match_regex:^(?=.*[A-Za-z\\d])(?=.*[$@$!%*#?&\\^\\\\\\/"\'<>;:+\\-()_~{}\\[\\]=])[A-Za-z\\d$@$!%*#?&\\^\\\\\\/"\'<>;:+\\-()_~{}\\[\\]=]{8,}$||Password has to be minimum 8 characters at least 1 special character']);
    if(password){
        validation_array = controller.mergeArrays(validation_array, password);
    }
    else {
        if(data.password != data.rpassword) {
            validation_array = controller.mergeArrays(validation_array, {password_error: 'Password and confirm password doesn\'t match'});
        }
    }

    var rpassword = controller.validate({rpassword: data.rpassword},['required']);
    if(rpassword){
        validation_array = controller.mergeArrays(validation_array, rpassword);
    }

    if(data.terms != 'true') {
        validation_array = controller.mergeArrays(validation_array, {terms_error: "You have to accept our terms and conditions to be able to continue"});
    }

    if(data.type == 'pharmacy' || data.type == 'treatment center') {
       var open_from = controller.validate({open_from: data.open_from},['required']);
       if(open_from){
            validation_array = controller.mergeArrays(validation_array, open_from);
       }

       var open_to = controller.validate({open_to: data.open_to},['required']);
       if(open_to){
            validation_array = controller.mergeArrays(validation_array, open_to);
       }
    }

    return validation_array;
}

module.exports = new authentication();
