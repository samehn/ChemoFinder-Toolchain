controller 					= require('../controller');

function manage_users(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    admin_model  = require('../../models/admin_model');
    user_suspension_model = require('../../models/user_suspension_model');
};
manage_users.prototype.constructor = manage_users;


manage_users.prototype.manage_users_page =  function(req, res) {
    tomodel.approve = '0';
    user_model.async_select_users_approval_option(tomodel, function(non_approved_users) {
        tomodel.approve = '1';
        user_model.async_select_users_approval_option(tomodel, function(approved_users) {
           res.render('admin/manage_users', {non_approved_users: non_approved_users, approved_users: approved_users, admin_type: req.session.admin_type});
        });
    });
}

manage_users.prototype.get_user_history =  function(req, res) {
    var user_id = req.body.id;
    if(Number.isInteger(parseInt(user_id))) {
        tomodel.user_id = user_id;
        user_suspension_model.async_select_user_suspension(tomodel, function(user_suspension_history) {
            if(user_suspension_history.length > 0){
                res.send({message:'success', results: user_suspension_history});
            }
            else{
                res.send({message:'failed'});
            }
        });
    }
    else {
        res.send({message:'failed'});
    }
}

manage_users.prototype.add_new_user =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = new_user_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        controller.bcrypt.hash(data.password, controller.saltRounds, function(err, hash) {
            // Store hash in your password DB.
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

            tomodel.first_login = '1';
            tomodel.active = '1';
            tomodel.approve = '1';
            user_model.async_insert_user(tomodel, function(rows) {
                if(data.type == 'pharmacy' || data.type == 'treatment center') {
                    user_model.async_select_user_by_email(tomodel, function(user) {
                        tomodel.user_id = user[0].ID;
                        tomodel.open_from = data.open_from;
                        tomodel.open_to = data.open_to;
                        if(!data.open_from || !data.open_to) {
                            tomodel.open_from = '12:00:00';
                            tomodel.open_to = '12:00:00';
                        }
                        //insert new pharmacy
                        user_pharmacy_model.async_insert_user_pharmacy(tomodel, function(rows) {
                            res.send({message: "success"});
                        }); 
                    });
                }
                else {
                    res.send({message: "success"});
                }
                //Send Confirmation Email
                var link = req.protocol + '://' + req.get('host');
                var mailOptions = {
                    from: 'chemofinder@gmail.com', // sender address
                    to: data.email, // list of receivers
                    subject: 'New Account', // Subject line
                    template: 'new_account_mail',
                    context: {
                        link: link,
                        password: data.password
                    }
                    //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                };
                controller.sendEmail(mailOptions);
            });
        });
    }       
}

manage_users.prototype.add_new_admin =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = new_admin_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        controller.bcrypt.hash(data.password, controller.saltRounds, function(err, hash) {
            // Store hash in your password DB.
            tomodel.email = data.email;
            tomodel.password = hash;
            tomodel.username = data.name;
            tomodel.type = data.type;
            user_model.async_insert_admin(tomodel, function(user) {
                //Send Confirmation Email
                var link = req.protocol + '://' + req.get('host');
                var mailOptions = {
                    from: 'chemofinder@gmail.com', // sender address
                    to: data.email, // list of receivers
                    subject: 'New Account', // Subject line
                    template: 'new_account_mail',
                    context: {
                        link: link,
                        password: data.password
                    }
                    //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                };
                controller.sendEmail(mailOptions);
                res.send({message: "success"});
            });
        });
    }
}

manage_users.prototype.approve_user =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = user_approve_validations(data);

    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.approve = '1';
        tomodel.user_id = data.id;
        user_model.async_update_user_approve(tomodel, function(rows) {
            user_model.async_select_user_by_id(tomodel, function(user) {
                if(user.length > 0)
                {
                    var link = req.protocol + '://' + req.get('host');
                    var mailOptions = {
                        from: 'chemofinder@gmail.com', // sender address
                        to: user[0].EMAIL, // list of receivers
                        subject: 'Account Approval', // Subject line
                        template: 'account_approval_mail',
                        context: {
                            link: link
                        }
                        //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                    };
                    controller.sendEmail(mailOptions);
                    res.send({message: "success"});
                }
                else
                {
                    res.send({message: "failed"});
                }
            });
        });
    }
}

manage_users.prototype.suspend_user =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = user_validations(data);

    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.active = '0';
        tomodel.user_id = data.id;
        user_model.async_update_user_active(tomodel, function(rows) {
            tomodel.suspension_reason = data.suspension_reason;
            tomodel.type = 0;
            user_suspension_model.async_insert_user_suspension(tomodel, function(rows) {
                user_model.async_select_user_by_id(tomodel, function(user) {
                    if(user.length > 0)
                    {
                        if(data.suspension_email == 'true')
                        {
                            var mailOptions = {
                                from: 'chemofinder@gmail.com', // sender address
                                to: user[0].EMAIL, // list of receivers
                                subject: 'Account Suspension', // Subject line
                                template: 'account_suspension_mail',
                                context: {
                                    message: data.suspension_reason
                                }
                                //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                            };
                            controller.sendEmail(mailOptions);    
                        }
                        
                        res.send({message: "success"});
                    }
                    else
                    {
                        res.send({message: "failed"});
                    }
                });
            });
        });
    }
}

manage_users.prototype.activate_user =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = user_validations(data);

    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.active = '1';
        tomodel.user_id = data.id;
        user_model.async_update_user_active(tomodel, function(rows) {
            tomodel.suspension_reason = data.suspension_reason;
            tomodel.type = 1;
            user_suspension_model.async_insert_user_suspension(tomodel, function(rows) {
                user_model.async_select_user_by_id(tomodel, function(user) {
                    if(user.length > 0)
                    {
                        var link = req.protocol + '://' + req.get('host');
                        var mailOptions = {
                            from: 'chemofinder@gmail.com', // sender address
                            to: user[0].EMAIL, // list of receivers
                            subject: 'Account Activation', // Subject line
                            template: 'account_activation_mail',
                            context: {
                                link: link
                            }
                            //html: {path: './views/emails/forgot_password_mail.html'} // You can choose to send an HTML body instead
                        };
                        controller.sendEmail(mailOptions);
                        res.send({message: "success"});
                    }
                    else
                    {
                        res.send({message: "failed"});
                    }
                });
            });
        });
    }
}

manage_users.prototype.delete_user =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = user_approve_validations(data);

    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed'});
        res.send(result);
    }
    else {
        tomodel.user_id = data.id;
        user_model.async_delete_user(tomodel, function(rows) {
            res.send({message: "success"});
        });
    }
}

function user_approve_validations(data) {
    var validation_array = {};
    
    var user_id = controller.validate({user_id: data.id},['required', 'integer']);
    if(user_id){
        validation_array = controller.mergeArrays(validation_array, user_id);
    }
    else {
        tomodel.user_id = data.id;
        var user =  user_model.select_user_by_id(tomodel);
        if(user.length == 0) {
            validation_array = controller.mergeArrays(validation_array, {user_id_error: 'This is not a valid id'});
        }
    }

    return validation_array;
}

function user_validations(data) {
    var validation_array = {};
    
    var user_id = controller.validate({user_id: data.id},['required', 'integer']);
    if(user_id){
        validation_array = controller.mergeArrays(validation_array, user_id);
    }
    else {
        tomodel.user_id = data.id;
        var user =  user_model.select_user_by_id(tomodel);
        if(user.length == 0) {
            validation_array = controller.mergeArrays(validation_array, {user_id_error: 'This is not a valid id'});
        }
    }
    var suspension_reason = controller.validate({suspension_reason: data.suspension_reason},['length:0-1000']);
    if(suspension_reason){
        validation_array = controller.mergeArrays(validation_array, suspension_reason);
    }

    return validation_array;
}

function new_user_validations(data) {
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

function new_admin_validations(data) {
    var validation_array = {};
    
    var email = controller.validate({email: data.email},['required', 'email', 'length:0-60']);
    if(email){
        validation_array = controller.mergeArrays(validation_array, email);
    }
    else {
        tomodel.email = data.email;
        var admin =  admin_model.select_admin_by_email(tomodel);
        if(admin.length > 0) {
            validation_array = controller.mergeArrays(validation_array, {email_error: 'This email is already registered'});
        }
    }

    var password = controller.validate({password: data.password},['required', 'length:8-200', 'match_regex:^(?=.*[A-Za-z\\d])(?=.*[$@$!%*#?&\\^\\\\\\/"\'<>;:+\\-()_~{}\\[\\]=])[A-Za-z\\d$@$!%*#?&\\^\\\\\\/"\'<>;:+\\-()_~{}\\[\\]=]{8,}$||Password has to be minimum 8 characters at least 1 special character']);
    if(password){
        validation_array = controller.mergeArrays(validation_array, password);
    }

    var name = controller.validate({name: data.name},['required']);
    if(name){
        validation_array = controller.mergeArrays(validation_array, name);
    }
    else {
        tomodel.username = data.name;
        var admin =  admin_model.select_admin_by_username(tomodel);
        if(admin.length > 0) {
            validation_array = controller.mergeArrays(validation_array, {name_error: 'This username is already registered'});
        }
    }

    var type = controller.validate({type: data.type},['required']);
    if(type){
        validation_array = controller.mergeArrays(validation_array, type);
    }
    else {
       var types = [0, 1];
       if(!types.includes(parseInt(data.type))) {
            validation_array = controller.mergeArrays(validation_array, {type_error: 'This is not a valid type'});       
       } 
    }

    return validation_array;
}

module.exports = new manage_users();
