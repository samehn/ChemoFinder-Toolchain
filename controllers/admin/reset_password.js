controller 					= require('../controller');

function reset_password(){
	tomodel = {};
	admin_model 	= require('../../models/admin_model');
	admin_forgot_password_model = require('../../models/admin_forgot_password_model');
};
reset_password.prototype.constructor = reset_password;


reset_password.prototype.reset_password_page =  function(req, res) {
	tomodel.token = req.params.token;
	admin_forgot_password_model.async_admin_select_forgot_password_by_token(tomodel, function(forgot_password) {
        if(forgot_password.length > 0) {
            // check the expiration date of the token
            var tokenDate = new Date(forgot_password[0].CREATED_AT);
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
                var admin_type = 'admin';
                res.render('user/reset_password', {admin_type: admin_type });
            }
        }
        else
        {
            res.send("404 Not Found");
        }
    });
}

reset_password.prototype.reset_password_process =  function(req, res) {
	// check if the token exists
	tomodel.token = req.body.token;
	admin_forgot_password_model.async_admin_select_forgot_password_by_token(tomodel, function(forgot_password) {
        if(forgot_password.length > 0) {
            // check the expiration date of the token
            var tokenDate = new Date(forgot_password[0].CREATED_AT);
            var now = new Date();

            //get difference in milliseconds
            var diff = Math.abs(now-tokenDate);
            //get difference in hours
            diff = diff/(1000*60*60);
            if(diff > 3)
            {
                res.send({message:"failed", password_error: "This link is already expired"});       
            }
            else
            {
                var data = controller.xssClean(req.body);
                var validation_array = reset_password_validations(data);
                
                if(Object.keys(validation_array).length > 0){
                    var result = controller.mergeArrays(validation_array, {message:'failed'});
                    res.send(result);
                }
                else {
                    controller.bcrypt.hash(data.password, controller.saltRounds, function(err, hash) {
                        // Store hash in your password DB.
                        tomodel.password = hash;
                        tomodel.admin_id = forgot_password[0].ADMIN_ID;
                        admin_model.async_update_admin_password(tomodel, function(rows) {
                            res.send({message: "success"});
                        });
                    });
                }
            }
        }
        else
        {
            res.send({message:"failed", password_error: "This is not a valid token"});
        }
    });
}

function reset_password_validations(data) {
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

module.exports = new reset_password();
