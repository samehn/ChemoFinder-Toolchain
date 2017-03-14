model 					= require('./model');
var admin_forgot_password_model 			= function(){ };
admin_forgot_password_model.prototype.constructor  	= admin_forgot_password_model;
admin_forgot_password_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

admin_forgot_password_model.prototype.admin_select_forgot_password_by_token = function(data) {
	var query = "SELECT * FROM DASH5082.ADMIN_FORGOT_PASSWORD WHERE TOKEN ='" + this.mysql_real_escape_string(data.token) + "'";
	console.log(query);
	return this.dbQuerySync(query);
};

admin_forgot_password_model.prototype.admin_delete_forgot_password_by_id = function(data) {
	console.log(query);
	var query = "DELETE FROM DASH5082.ADMIN_FORGOT_PASSWORD WHERE ADMIN_ID ='" + this.mysql_real_escape_string(data.admin_id) + "';";
	console.log(query);
	return this.dbQuerySync(query);
};

admin_forgot_password_model.prototype.admin_insert_forgot_password = function(data) {
	var query = "INSERT INTO DASH5082.ADMIN_FORGOT_PASSWORD (ADMIN_ID, TOKEN, CREATED_AT) values (" + this.mysql_real_escape_string(data.admin_id) + ", '" + this.mysql_real_escape_string(data.token) + "', CURRENT_TIMESTAMP);";
	console.log(query);
	return this.dbQuerySync(query);
};

module.exports = new admin_forgot_password_model();