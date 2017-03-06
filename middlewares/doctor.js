function doctor(){
	tomodel = {};
};
doctor.prototype.constructor = doctor;

doctor.prototype.doctor_check_first_login = function(req, res, next) {
    if(req.session.doctor_id){
        if(req.session.doctor_first_login == '1')
        {
           next();     //If session exists, proceed to page 
        }
        else
        {
            res.redirect('/doctor');    
        }
    } else {
        res.redirect('/');
    }
}

doctor.prototype.doctor_check_sign_in = function(req, res, next) {
    if(req.session.doctor_id){
        if(req.session.doctor_first_login == '0')
        {
           next();     //If session exists, proceed to page 
        }
        else
        {
            res.redirect('/doctor/first_changepassword');    
        }
    } else {
        res.redirect('/');
    }
}

module.exports = new doctor();