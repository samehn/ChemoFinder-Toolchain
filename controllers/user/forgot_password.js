controller 					= require('../controller');

function forgot_password(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
	user_forgot_password_model = require('../../models/user_forgot_password_model');
};

forgot_password.prototype.constructor = forgot_password;


forgot_password.prototype.forgot_password_page =  function(req, res) {
	var user_type = 'user';
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
        	tomodel.token = randtoken.generate(120);
        	var forgot_password = user_forgot_password_model.select_forgot_password_by_token(tomodel);
        	if(forgot_password.length == 0) {
        		flag = false;
        	}
        }
        tomodel.email = data.email;
        var user = user_model.select_user_by_email(tomodel);
        //Delete old tokens if exists
        tomodel.user_id = user[0].ID;
        user_forgot_password_model.delete_forgot_password_by_id(tomodel);
        
        //insert new token into the database
        user_forgot_password_model.insert_forgot_password(tomodel);
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
    	tomodel.email = data.email;
        var user =  user_model.select_user_by_email(tomodel);
        if(user.length == 0) {
            validation_array = controller.mergeArrays(validation_array, {email_error: 'This email is not registered'});
        }
    }
    return validation_array;
}
module.exports = new forgot_password();
