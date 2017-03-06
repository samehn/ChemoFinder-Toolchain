model 					= require('./model');
var user_forgot_password_model 			= function(){ };
user_forgot_password_model.prototype.constructor  	= user_forgot_password_model;
user_forgot_password_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

user_forgot_password_model.prototype.select_forgot_password_by_token = function(data) {
	var query = "SELECT FROM DASH5082.USER_FORGOT_PASSWORD WHERE TOKEN ='" + data.token + "'";
	return this.dbQuerySync(query);
};

user_forgot_password_model.prototype.delete_forgot_password_by_id = function(data) {
	var query = "DELETE from DASH5082.USER_FORGOT_PASSWORD WHERE USER_ID ='" + data.user_id + "';";
	return this.dbQuerySync(query);
};

user_forgot_password_model.prototype.insert_forgot_password = function(data) {
	var query = "INSERT INTO DASH5082.USER_FORGOT_PASSWORD (USER_ID, TOKEN, CREATED_AT) values (" + data.user_id + ", '" + data.token + "', CURRENT_TIMESTAMP);";
	return this.dbQuerySync(query);
};

module.exports = new user_forgot_password_model();