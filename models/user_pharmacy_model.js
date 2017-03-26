model 					= require('./model');
var user_pharmacy_model 			= function(){ };
user_pharmacy_model.prototype.constructor  	= user_pharmacy_model;
user_pharmacy_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

user_pharmacy_model.prototype.insert_user_pharmacy = function(data) {
	var query = "INSERT INTO DASH5082.CHEMO_USER_PHARMACY (PHARMACY_ID, OPEN_FROM, OPEN_TO) VALUES (" + this.mysql_real_escape_string(data.user_id) + ", '" + this.mysql_real_escape_string(data.open_from) + "', '" + this.mysql_real_escape_string(data.open_to) + "');";
	return this.dbQuerySync(query);
};

user_pharmacy_model.prototype.update_user_pharmacy = function(data) {
	var query = "UPDATE DASH5082.CHEMO_USER_PHARMACY SET OPEN_FROM ='" + this.mysql_real_escape_string(data.open_from) + "', OPEN_TO = '" + this.mysql_real_escape_string(data.open_to) + "', UPDATED_AT = CURRENT_TIMESTAMP WHERE PHARMACY_ID = " + this.mysql_real_escape_string(data.user_id);
	console.log(query);
	return this.dbQuerySync(query);
};

user_pharmacy_model.prototype.update_stock_time = function(data) {
	var query = "UPDATE DASH5082.CHEMO_USER_PHARMACY SET STOCK_UPDATE = CURRENT_TIMESTAMP, UPDATED_AT = CURRENT_TIMESTAMP WHERE PHARMACY_ID = " + this.mysql_real_escape_string(data.user_id);
	return this.dbQuerySync(query);
};

//+++++++++++++++++++++++ASYNC+++++++++++++++++++++++++++++++++++

user_pharmacy_model.prototype.async_insert_user_pharmacy = function(data, callback) {
	var query = "INSERT INTO DASH5082.CHEMO_USER_PHARMACY (PHARMACY_ID, OPEN_FROM, OPEN_TO) VALUES (" + this.mysql_real_escape_string(data.user_id) + ", '" + this.mysql_real_escape_string(data.open_from) + "', '" + this.mysql_real_escape_string(data.open_to) + "');";
	return this.dbQuery(query, callback);
};

user_pharmacy_model.prototype.async_update_user_pharmacy = function(data, callback) {
	var query = "UPDATE DASH5082.CHEMO_USER_PHARMACY SET OPEN_FROM ='" + this.mysql_real_escape_string(data.open_from) + "', OPEN_TO = '" + this.mysql_real_escape_string(data.open_to) + "', UPDATED_AT = CURRENT_TIMESTAMP WHERE PHARMACY_ID = " + this.mysql_real_escape_string(data.user_id);
	console.log(query);
	return this.dbQuery(query, callback);
};

user_pharmacy_model.prototype.async_update_stock_time = function(data, callback) {
	var query = "UPDATE DASH5082.CHEMO_USER_PHARMACY SET STOCK_UPDATE = CURRENT_TIMESTAMP, UPDATED_AT = CURRENT_TIMESTAMP WHERE PHARMACY_ID = " + this.mysql_real_escape_string(data.user_id);
	return this.dbQuery(query, callback);
};

module.exports = new user_pharmacy_model();
