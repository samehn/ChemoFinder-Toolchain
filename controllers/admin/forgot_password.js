controller 					= require('../controller');

function forgot_password(){
	tomodel = {};
	admin_model    = require('../../models/admin_model');
	admin_forgot_password_model = require('../../models/admin_forgot_password_model');
};

forgot_password.prototype.constructor = forgot_password;


forgot_password.prototype.forgot_password_page =  function(req, res) {
	var user_type = 'admin';
    res.render('user/forgot_password', {user_type: user_type});
}

forgot_password.prototype.forgot_password_process =  function(req, res) {
	var data = controller.xssClean(req.body);
    var validation_array = forgot_password_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        //generate random token
        // Generate a 20 character alpha-numeric token:
        var flag = true;
        while(flag) {
        	tomodel.token = controller.randtoken.generate(120);
        	var forgot_password = admin_forgot_password_model.admin_select_forgot_password_by_token(tomodel);
        	if(forgot_password.length == 0) {
        		flag = false;
        	}
        }
        tomodel.key = data.email;
        var admin = admin_model.select_admin_by_key(tomodel);
        //Delete old tokens if exists
        tomodel.admin_id = admin[0].ID;
        admin_forgot_password_model.admin_delete_forgot_password_by_id(tomodel);
        
        //insert new token into the database
        admin_forgot_password_model.admin_insert_forgot_password(tomodel);
        res.send({message: "success"});
        var base = req.protocol + '://' + req.get('host');
        var link = base + '/admin/resetpassword/' + tomodel.token;
        //send email
        var mailOptions = {
            from: 'chemofinder@gmail.com', // sender address
            to: data.email, // list of receivers
            subject: 'Password Recovery', // Subject line
            template: 'forgot_password_mail',
            context: {
                link: link
            }
            //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
        };
        controller.sendEmail(mailOptions);        
    }
}

function forgot_password_validations(data) {
	var validation_array = {};
    console.log(data);
    var email = controller.validate({email: data.email},['required']);
    if(email){
        validation_array = controller.mergeArrays(validation_array, email);
    }
    else {
    	tomodel.key = data.email;
        var admin =  admin_model.select_admin_by_key(tomodel);
        if(admin.length == 0) {
            validation_array = controller.mergeArrays(validation_array, {email_error: 'This email is not registered'});
        }
    }
    return validation_array;
}
module.exports = new forgot_password();
