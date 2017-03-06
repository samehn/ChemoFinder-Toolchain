model 					= require('./model');
var user_suspension_model 			= function(){ };
user_suspension_model.prototype.constructor  	= user_suspension_model;
user_suspension_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

user_suspension_model.prototype.select_user_suspension = function(data) {
	var query = "SELECT * from DASH5082.USER_SUSPENSION WHERE USER_ID = " + data.user_id ;
	return this.dbQuerySync(query);
};

user_suspension_model.prototype.insert_user_suspension = function(data) {
	var query = "INSERT INTO DASH5082.USER_SUSPENSION (USER_ID, SUSPENSION_REASON, TYPE, CREATED_AT) VALUES (" + data.user_id + ", '" + data.suspension_reason + "', " + data.type + ", CURRENT_TIMESTAMP);";
	return this.dbQuerySync(query);
};

module.exports = new user_suspension_model();