controller 					= require('../controller');

function profile(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
};
profile.prototype.constructor = profile;

profile.prototype.profile_page =  function(req, res) {
    tomodel.user_id = req.session.user_id;
    var pharmacy_info = user_model.select_user_by_id(tomodel);
    res.render('pharmacy/profile', {info: pharmacy_info});
}

profile.prototype.update_profile =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = profile_validations(req, data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else
    {
        tomodel.user_id = req.session.user_id;
        tomodel.email = data.email;
        tomodel.name = data.name;
        tomodel.phone_number = data.phone_number;
        tomodel.street = data.street;
        tomodel.city = data.city;
        tomodel.state = data.state;
        tomodel.zip = data.zip;
        tomodel.open_from = data.open_from;
        tomodel.open_to = data.open_to;
        if(!data.open_from || !data.open_to) {
            tomodel.open_from = '12:00:00';
            tomodel.open_to = '12:00:00';
        }
        var user = user_model.update_user(tomodel);
        res.send({message: "success"});
    }       
}

profile.prototype.change_password =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = change_password_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else
    {
        tomodel.user_id = req.session.user_id;
        var result = user_model.select_user_by_id(tomodel);
        controller.bcrypt.compare(data.old_password, result[0].PASSWORD, function(err, cmp) {
            // res == true
            if(cmp)
            {
                controller.bcrypt.hash(data.new_password, controller.saltRounds, function(err, hash) {
                    tomodel.password = hash;
                    user_model.update_password(tomodel);
                    res.send({message: "success"});
                });
            }
            else
            {
                res.send({message: "failed", old_password_error: "Wrong Password"});
            }
        });
    }
}

function profile_validations(req, data) {
    var validation_array = {};

    var email = controller.validate({email: data.email},['required', 'email', 'length:0-60']);
    if(email){
        validation_array = controller.mergeArrays(validation_array, email);
    }
    else {
        tomodel.email = data.email;
        var user =  user_model.select_user_by_email(tomodel);
        if(user.length > 0 && user[0].ID != req.session.user_id) {
            validation_array = controller.mergeArrays(validation_array, {email_error: 'This email is already registered'});
        }
    }

    var name = controller.validate({name: data.name},['required']);
    if(name){
        validation_array = controller.mergeArrays(validation_array, name);
    }
 
    var street = controller.validate({street: data.street},['required']);
    if(street){
        validation_array = controller.mergeArrays(validation_array, street);
    }

    var city = controller.validate({city: data.city},['required']);
    if(city){
        validation_array = controller.mergeArrays(validation_array, city);
    }

    var state = controller.validate({state: data.state},['required']);
    if(state){
        validation_array = controller.mergeArrays(validation_array, state);
    }

    var zip = controller.validate({zip: data.zip},['required']);
    if(zip){
        validation_array = controller.mergeArrays(validation_array, zip);
    }

    var phone_number = controller.validate({phone_number: data.phone_number},['required']);
    if(phone_number){
        validation_array = controller.mergeArrays(validation_array, phone_number);
    }

    var open_from = controller.validate({open_from: data.open_from},['required']);
    if(open_from){
        validation_array = controller.mergeArrays(validation_array, open_from);
    }

    var open_to = controller.validate({open_to: data.open_to},['required']);
    if(open_to){
        validation_array = controller.mergeArrays(validation_array, open_to);
    }
    return validation_array;
}

function change_password_validations(data) {
    var validation_array = {};

    var old_password = controller.validate({old_password: data.old_password},['required', 'length:8-200']);
    if(old_password){
        validation_array = controller.mergeArrays(validation_array, old_password);
    }

    var new_password = controller.validate({new_password: data.new_password},['required', 'length:8-200', 'match_regex:^(?=.*[A-Za-z\\d])(?=.*[$@$!%*#?&\\^\\\\\\/"\'<>;:+\\-()_~{}\\[\\]=])[A-Za-z\\d$@$!%*#?&\\^\\\\\\/"\'<>;:+\\-()_~{}\\[\\]=]{8,}$||Password has to be minimum 8 characters at least 1 special character']);
    if(new_password){
        validation_array = controller.mergeArrays(validation_array, new_password);
    }
    else {
        if(data.new_password != data.rnew_password) {
            validation_array = controller.mergeArrays(validation_array, {new_password_error: 'Password and confirm password doesn\'t match'});
        }
    }

    var rnew_password = controller.validate({rnew_password: data.rnew_password},['required']);
    if(rnew_password){
        validation_array = controller.mergeArrays(validation_array, rnew_password);
    }

    return validation_array;
}

module.exports = new profile();
