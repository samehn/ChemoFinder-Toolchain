model 					= require('./model');
var user_pharmacy_model 			= function(){ };
user_pharmacy_model.prototype.constructor  	= user_pharmacy_model;
user_pharmacy_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

user_pharmacy_model.prototype.insert_user_pharmacy = function(data) {
	var query = "INSERT INTO DASH5082.CHEMO_USER_PHARMACY (PHARMACY_ID, OPEN_FROM, OPEN_TO) VALUES (" + data.user_id + ", '" + data.open_from + "', '" + data.open_to + "');";
	return this.dbQuerySync(query);
};

user_pharmacy_model.prototype.update_user_pharmacy = function(data) {
	var query = "UPDATE DASH5082.CHEMO_USER_PHARMACY SET OPEN_FROM ='" + data.open_from + "', OPEN_TO = '" + data.open_to + "', UPDATED_AT = CURRENT_TIMESTAMP WHERE PHARMACY_ID = " + data.user_id;
	console.log(query);
	return this.dbQuerySync(query);
};

user_pharmacy_model.prototype.update_stock_time = function(data) {
	var query = "UPDATE DASH5082.CHEMO_USER_PHARMACY SET STOCK_UPDATE = CURRENT_TIMESTAMP, UPDATED_AT = CURRENT_TIMESTAMP WHERE ID = " + data.user_id;
	return this.dbQuerySync(query);
};

module.exports = new user_pharmacy_model();