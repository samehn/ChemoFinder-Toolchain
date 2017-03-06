model 					= require('./model');
var admin_forgot_password_model 			= function(){ };
admin_forgot_password_model.prototype.constructor  	= admin_forgot_password_model;
admin_forgot_password_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

admin_forgot_password_model.prototype.select_forgot_password_by_token = function(data) {
	var query = "SELECT FROM DASH5082.ADMIN_FORGOT_PASSWORD WHERE TOKEN ='" + data.token + "'";
	return this.dbQuerySync(query);
};

admin_forgot_password_model.prototype.delete_forgot_password_by_id = function(data) {
	var query = "DELETE from DASH5082.ADMIN_FORGOT_PASSWORD WHERE admin_ID ='" + data.admin_id + "';";
	return this.dbQuerySync(query);
};

admin_forgot_password_model.prototype.insert_forgot_password = function(data) {
	var query = "INSERT INTO DASH5082.ADMIN_FORGOT_PASSWORD (ADMIN_ID, TOKEN, CREATED_AT) values (" + data.admin_id + ", '" + data.token + "', CURRENT_TIMESTAMP);";
	return this.dbQuerySync(query);
};

module.exports = new admin_forgot_password_model();