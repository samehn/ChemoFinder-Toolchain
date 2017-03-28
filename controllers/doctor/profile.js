controller 					= require('../controller');

function profile(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
};

profile.prototype.constructor = profile;


profile.prototype.profile_page =  function(req, res) {
    tomodel.user_id = req.session.doctor_id; 
    user_model.async_select_user_by_id(tomodel, function(user_info) {
        res.render('doctor/profile', {info: user_info});
    });
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
        tomodel.user_id = req.session.doctor_id;
        user_model.async_select_user_by_id(tomodel, function(result) {
            controller.bcrypt.compare(data.old_password, result[0].PASSWORD, function(err, cmp) {
                // res == true
                if(cmp)
                {
                    controller.bcrypt.hash(data.new_password, controller.saltRounds, function(err, hash) {
                        tomodel.password = hash;
                        user_model.async_update_user_password(tomodel, function(rows) {
                            res.send({message: "success"});
                        });
                    });
                }
                else
                {
                    res.send({message: "failed", old_password_error: "Wrong Password"});
                }
            });
        });
    }
}

profile.prototype.update_profile =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = profile_validations(req, data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.user_id = req.session.doctor_id;
        tomodel.name = data.name;
        tomodel.position = data.position;
        tomodel.entity_name = data.entity_name;
        tomodel.phone_number = data.phone_number;
        tomodel.address = data.address;
        tomodel.city = data.city;
        tomodel.country = data.country;
        tomodel.email = data.email;
        user_model.async_update_user(tomodel, function(user) {
            res.send({message: "success"});
        });
    }
}

function profile_validations(req, data) {
    var validation_array = {};

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
        if(user.length > 0 && user[0].ID != req.session.doctor_id) {
            validation_array = controller.mergeArrays(validation_array, {email_error: 'This email is already registered'});
        }
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
