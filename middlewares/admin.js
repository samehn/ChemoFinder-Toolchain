function admin(){
	tomodel = {};
};
admin.prototype.constructor = admin;


admin.prototype.check_admin_sign_in = function(req, res, next){
    if(req.session.admin_id){
        next();     //If session exists, proceed to page 
    } else {
        var err = new Error("Not logged in!");
        next(err);  //Error, trying to access unauthorized page!
    }
}

module.exports = new admin();
