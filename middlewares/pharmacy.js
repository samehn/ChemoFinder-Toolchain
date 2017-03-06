function pharmacy(){
	tomodel = {};
};
pharmacy.prototype.constructor = pharmacy;

pharmacy.prototype.pharmacy_check_first_login = function(req, res, next){
    if(req.session.pharmacy_id){
        if(req.session.pharmacy_first_login == '1')
        {
           next();     //If session exists, proceed to page 
        }
        else
        {
            res.redirect('/pharmacy');   
        }
    } else {
        res.redirect('/');
    }
}

pharmacy.prototype.pharmacy_check_sign_in = function(req, res, next){
    if(req.session.pharmacy_id){
        if(req.session.pharmacy_first_login == '0')
        {
           next();     //If session exists, proceed to page 
        }
        else
        {
            res.redirect('/pharmacy/first_changepassword');    
        }
    } else {
        res.redirect('/');
    }
}
module.exports = new pharmacy();
