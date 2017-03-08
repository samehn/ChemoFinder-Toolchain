model 					= require('./model');
var user_model 			= function(){ };
user_model.prototype.constructor  	= user_model;
user_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

user_model.prototype.select_pharmacy_by_medicine_id = function(data) {
	var query = "SELECT U.ID AS ID, U.EMAIL, U.NAME, U.PHONE_NUMBER, U.STREET, U.CITY, U.STATE, U.ZIP, U.OPEN_FROM, U.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, U.STOCK_UPDATE AS LAST_UPDATE FROM DASH5082.CHEMO_MEDICINE M JOIN CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN USER U ON U.ID = S.PHARMACY_ID WHERE M.APPROVED = TRUE AND M.ID =" + data.medicine_id + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)";
	return this.dbQuerySync(query);
};

user_model.prototype.get_all_approved_medicines = function() {
	var query = "SELECT DISTINCT GENERIC_NAME, FORM from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
	return this.dbQuerySync(query);
};

user_model.prototype.select_user_by_email = function(data) {
	var query = "SELECT * from DASH5082.USER WHERE EMAIL ='" + data.email + "';";
	return this.dbQuerySync(query);
};

user_model.prototype.select_user_by_id = function(data) {
	var query = "SELECT * from DASH5082.USER WHERE ID ='" + data.user_id + "';";
	return this.dbQuerySync(query);
};

user_model.prototype.insert_user = function(data) {
	var query = "INSERT INTO DASH5082.USER (EMAIL, PASSWORD, NAME, PHONE_NUMBER, STREET, CITY, STATE, ZIP, OPEN_FROM, OPEN_TO, TYPE, FIRST_LOGIN, ACTIVE, APPROVE) VALUES ('" + data.email + "','" + data.password + "','" + data.name + "','" + data.phone_number + "','" + data.street + "','" + data.city + "','" + data.state + "','" + data.zip + "','" + data.open_from + "','" + data.open_to + "','" + data.type + "', '" + data.first_login + "', '" + data.active + "', '" + data.approve + "');";
	console.log(query);
	return this.dbQuerySync(query);
};

user_model.prototype.update_user_password = function(data) {
	var query = "UPDATE DASH5082.USER SET PASSWORD ='" + data.password + "' WHERE ID =" + data.user_id + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.select_users_approval_option = function(data) {
	var query = "SELECT * from DASH5082.USER WHERE APPROVE='" + data.approve + "'";
	return this.dbQuerySync(query);
};

user_model.prototype.update_user_approve = function(data) {
	var query = "UPDATE DASH5082.USER SET APPROVE='" + data.approve + "' WHERE ID=" + data.user_id + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.update_user_active = function(data) {
	var query = "UPDATE DASH5082.USER SET ACTIVE='" + data.active + "' WHERE ID=" + data.user_id + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.delete_user = function(data) {
	var query = "DELETE FROM USER WHERE ID=" + data.user_id + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.update_user_first_password = function(data) {
	var query = "UPDATE DASH5082.USER SET PASSWORD ='" + data.password + "', FIRST_LOGIN = '0' WHERE ID =" + data.user_id + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.update_password = function(data) {
	var query = "UPDATE DASH5082.USER SET PASSWORD ='" + data.password + "' WHERE ID =" + data.user_id + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.update_user = function(data) {
	query = "UPDATE DASH5082.USER SET EMAIL='" + data.email + "', NAME ='" + data.name + "', STREET ='" + data.street + "', CITY ='" + data.city + "', STATE ='" + data.state + "', ZIP ='" + data.zip + "', PHONE_NUMBER ='" + data.phone_number + "', OPEN_FROM='" + data.open_from + "', OPEN_TO='" + data.open_to + "' WHERE ID =" + data.user_id;
	return this.dbQuerySync(query);
};

user_model.prototype.update_user_doctor = function(data) {
	query = "UPDATE DASH5082.USER SET EMAIL='" + data.email + "', NAME ='" + data.name + "', STREET ='" + data.street + "', CITY ='" + data.city + "', STATE ='" + data.state + "', ZIP ='" + data.zip + "' WHERE ID =" + data.user_id;
	return this.dbQuerySync(query);
};

user_model.prototype.select_treatment_centers = function() {
	var query = "SELECT * FROM DASH5082.USER WHERE TYPE = 'TREATMENT CENTER'";
	return this.dbQuerySync(query);
};

user_model.prototype.select_treatment_center_by_id = function(data) {
	var query = "SELECT * FROM DASH5082.USER WHERE TYPE = 'TREATMENT CENTER' AND ID=" + data.user_id;
	return this.dbQuerySync(query);
};

user_model.prototype.select_pharmacies_by_medicine_and_quantity = function(data) {
	var query = "SELECT U.ID AS ID, U.EMAIL, U.NAME, U.PHONE_NUMBER, U.STREET, U.CITY, U.STATE, U.ZIP, U.OPEN_FROM, U.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, U.STOCK_UPDATE FROM DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN USER U ON U.ID = S.PHARMACY_ID WHERE M.APPROVED = TRUE AND U.TYPE='PHARMACY' AND M.ID =" + data.medicine_id + " AND S.AVAILABLE_STOCK >=" + data.quantity + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)";
	return this.dbQuerySync(query);	
};

user_model.prototype.update_stock_time = function(data) {
	var query = "UPDATE DASH5082.USER SET STOCK_UPDATE = CURRENT_TIMESTAMP WHERE ID = " + data.user_id;
	return this.dbQuerySync(query);
};

module.exports = new user_model();