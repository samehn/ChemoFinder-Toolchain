model 					= require('./model');
var user_suspension_model 			= function(){ };
user_suspension_model.prototype.constructor  	= user_suspension_model;
user_suspension_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

user_suspension_model.prototype.select_user_suspension = function(data) {
	var query = "SELECT * from DASH5082.USER_SUSPENSION WHERE USER_ID = " + this.mysql_real_escape_string(data.user_id) ;
	return this.dbQuerySync(query);
};

user_suspension_model.prototype.insert_user_suspension = function(data) {
	var query = "INSERT INTO DASH5082.USER_SUSPENSION (USER_ID, SUSPENSION_REASON, TYPE, CREATED_AT) VALUES (" + this.mysql_real_escape_string(data.user_id) + ", '" + this.mysql_real_escape_string(data.suspension_reason) + "', " + this.mysql_real_escape_string(data.type) + ", CURRENT_TIMESTAMP);";
	return this.dbQuerySync(query);
};

module.exports = new user_suspension_model();