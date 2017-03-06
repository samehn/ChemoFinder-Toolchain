controller 					= require('../controller');

function first_login(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
};

first_login.prototype.constructor = first_login;


first_login.prototype.first_login_page =  function(req, res) {
    res.render('user/first_changepassword');	
}

first_login.prototype.change_password =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = change_password_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else
    {
        controller.bcrypt.hash(data.password, controller.saltRounds, function(err, hash) {
          // Store hash in your password DB.
          tomodel.user_id = req.session.user_id;
          tomodel.password = hash;
          user_model.update_user_first_password(tomodel);
            req.session.user_first_login = '0';  
            res.send({message: "success"});
        });
    }  
}

function change_password_validations(data) {
    var validation_array = {};

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

    return validation_array;
}

module.exports = new first_login();
