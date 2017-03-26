controller 					= require('../controller');

function authentication(){
	tomodel = {};
	admin_model 	= require('../../models/admin_model');
};
authentication.prototype.constructor = authentication;

authentication.prototype.login_page =  function(req, res) {
    res.render('admin/login');
}

authentication.prototype.login =  function(req, res) {
    var data = controller.xssClean(req.body);
    var validation_array = login_validations(data);
    if(Object.keys(validation_array).length > 0){
        var result = controller.mergeArrays(validation_array, {message:'failed', login_error:"Please enter both email and password"});
        res.send(result);
    }

    else
    {
        tomodel.key = data.email;
        admin_model.async_select_admin_by_key(tomodel, function(user) {
            if(user.length > 0)
            {
                controller.bcrypt.compare(data.password, user[0].PASSWORD, function(err, cmp) {
                    // res == true
                    if(cmp)
                    {
                        if(user[0].ACTIVE == '0')
                        {
                            res.send({message: "failed", login_error: "Your account is suspended"});
                        }
                        else {
                            req.session.admin_id = user[0].ID;
                            req.session.admin_type = user[0].TYPE;
                            res.send({message: "success"});    
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

authentication.prototype.logout =  function(req, res) {
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/admin/login');
}

module.exports = new authentication();
