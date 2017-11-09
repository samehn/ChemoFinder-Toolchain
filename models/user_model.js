model 					= require('./model');
var user_model 			= function(){ };
user_model.prototype.constructor  	= user_model;
user_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

user_model.prototype.select_pharmacy_by_medicine_id = function(data) {
	var query = "SELECT U.ID AS ID, U.EMAIL, U.ENTITY_NAME, U.PHONE_NUMBER, U.ADDRESS, U.CITY, U.COUNTRY, UP.OPEN_FROM, UP.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, UP.STOCK_UPDATE AS LAST_UPDATE FROM DASH5082.CHEMO_MEDICINE M JOIN CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID JOIN DASH5082.CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE M.APPROVED = TRUE AND M.ID =" + data.medicine_id + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)";
	return this.dbQuerySync(query);
};

user_model.prototype.get_all_approved_medicines = function() {
	var query = "SELECT DISTINCT GENERIC_NAME, FORM from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
	return this.dbQuerySync(query);
};

user_model.prototype.select_user_by_email = function(data) {
	var query = "SELECT * from DASH5082.CHEMO_USER WHERE EMAIL ='" + data.email + "';";
	return this.dbQuerySync(query);
};

user_model.prototype.select_user_by_id = function(data) {
	var query = "SELECT * from DASH5082.CHEMO_USER WHERE ID ='" + data.user_id + "';";
	return this.dbQuerySync(query);
};

user_model.prototype.select_pharmacy_by_id = function(data) {
	var query = "SELECT * from DASH5082.CHEMO_USER U JOIN CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE U.ID ='" + data.user_id + "';";
	return this.dbQuerySync(query);
};

user_model.prototype.insert_user = function(data) {
	var query = "INSERT INTO DASH5082.CHEMO_USER (ENTITY_NAME, PERSON_NAME, PERSON_POSITION, EMAIL, PASSWORD, PHONE_NUMBER, ADDRESS, CITY, COUNTRY, TYPE, FIRST_LOGIN, ACTIVE, APPROVE) VALUES ('" + data.entity_name + "', '" + data.name + "', '" + data.position + "', '" + data.email + "', '" + data.password + "', '" + data.phone_number + "', '" + data.address + "', '" + data.city + "', '" + data.country + "', '" + data.type + "', '" + data.first_login + "', '" + data.active + "', '" + data.approve + "')";
	console.log(query);
	return this.dbQuerySync(query);
};

user_model.prototype.update_user_password = function(data) {
	var query = "UPDATE DASH5082.CHEMO_USER SET PASSWORD ='" + data.password + "', UPDATED_AT=CURRENT_TIMESTAMP WHERE ID =" + data.user_id + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.select_users_approval_option = function(data) {
	var query = "SELECT * from DASH5082.CHEMO_USER WHERE APPROVE='" + data.approve + "'";
	return this.dbQuerySync(query);
};

user_model.prototype.update_user_approve = function(data) {
	var query = "UPDATE DASH5082.CHEMO_USER SET APPROVE='" + data.approve + "', UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=" + data.user_id + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.update_user_active = function(data) {
	var query = "UPDATE DASH5082.CHEMO_USER SET ACTIVE='" + data.active + "', UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=" + data.user_id + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.delete_user = function(data) {
	var query = "DELETE FROM DASH5082.CHEMO_USER WHERE ID=" + this.mysql_real_escape_string(data.user_id) + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.update_user_first_password = function(data) {
	var query = "UPDATE DASH5082.CHEMO_USER SET PASSWORD ='" + this.mysql_real_escape_string(data.password) + "', FIRST_LOGIN = '0' WHERE ID =" + this.mysql_real_escape_string(data.user_id) + ";";
	return this.dbQuerySync(query);
};

user_model.prototype.update_user = function(data) {
	query = "UPDATE DASH5082.CHEMO_USER SET EMAIL='" + this.mysql_real_escape_string(data.email) + "', PERSON_NAME ='" + this.mysql_real_escape_string(data.name) + "', PERSON_POSITION ='" + this.mysql_real_escape_string(data.position) + "', ENTITY_NAME='" + this.mysql_real_escape_string(data.entity_name) + "', PHONE_NUMBER ='" + this.mysql_real_escape_string(data.phone_number) + "', ADDRESS ='" + this.mysql_real_escape_string(data.address) + "', CITY ='" + this.mysql_real_escape_string(data.city) + "', COUNTRY ='" + this.mysql_real_escape_string(data.country) + "', UPDATED_AT = CURRENT_TIMESTAMP WHERE ID =" + this.mysql_real_escape_string(data.user_id);
	return this.dbQuerySync(query);
};

user_model.prototype.select_treatment_centers = function() {
	var query = "SELECT * FROM DASH5082.CHEMO_USER WHERE TYPE = 'treatment center'";
	return this.dbQuerySync(query);
};

user_model.prototype.select_treatment_center_by_id = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_USER U JOIN DASH5082.CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE U.TYPE = 'treatment center' AND U.ID=" + this.mysql_real_escape_string(data.user_id);
	return this.dbQuerySync(query);
};

user_model.prototype.select_pharmacies_by_medicine_and_quantity = function(data) {
	var query = "SELECT U.ID AS ID, U.EMAIL, U.ENTITY_NAME, U.PHONE_NUMBER, U.ADDRESS, U.CITY, U.COUNTRY, UP.OPEN_FROM, UP.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, UP.STOCK_UPDATE AS LAST_UPDATE FROM DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID JOIN DASH5082.CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE M.APPROVED = TRUE AND U.TYPE='pharmacy' AND M.ID =" + this.mysql_real_escape_string(data.medicine_id) + " AND S.AVAILABLE_STOCK >=" + this.mysql_real_escape_string(data.quantity) + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)";
	return this.dbQuerySync(query);
};

user_model.prototype.select_pharmacies_by_medicine_and_quantity_and_price = function(data) {
	var query = "SELECT U.ID AS ID, U.EMAIL, U.ENTITY_NAME, U.PHONE_NUMBER, U.ADDRESS, U.CITY, U.COUNTRY, UP.OPEN_FROM, UP.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, UP.STOCK_UPDATE AS LAST_UPDATE FROM DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID JOIN DASH5082.CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE M.APPROVED = TRUE AND U.TYPE='pharmacy' AND M.ID =" + this.mysql_real_escape_string(data.medicine_id) + " AND S.PRICE_PER_PACK =" + this.mysql_real_escape_string(data.price) + " AND S.AVAILABLE_STOCK >=" + this.mysql_real_escape_string(data.quantity) + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)";
	console.log('select pharmacies by medicine and quantity and price query is');
	console.log(query);
	return this.dbQuerySync(query);
};

user_model.prototype.select_pharmacies_by_pharmacy_medicine_and_quantity_and_price = function(data) {
	var query = "SELECT U.ID AS ID, U.EMAIL, U.ENTITY_NAME, U.PHONE_NUMBER, U.ADDRESS, U.CITY, U.COUNTRY, UP.OPEN_FROM, UP.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, UP.STOCK_UPDATE AS LAST_UPDATE FROM DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID JOIN DASH5082.CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE M.APPROVED = TRUE AND U.TYPE='pharmacy' AND M.ID =" + this.mysql_real_escape_string(data.medicine_id) + " AND U.ID =" + this.mysql_real_escape_string(data.user_id) + " AND S.PRICE_PER_PACK =" + this.mysql_real_escape_string(data.price) + " AND S.AVAILABLE_STOCK >=" + this.mysql_real_escape_string(data.quantity) + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)";
	console.log('select pharmacies by medicine and quantity and price query is');
	console.log(query);
	return this.dbQuerySync(query);
};

//+++++++++++++++++++++++ASYNC+++++++++++++++++++++++++++++++++++

user_model.prototype.async_select_pharmacy_by_medicine_id = function(data, callback) {
	var query = "SELECT U.ID AS ID, U.EMAIL, U.ENTITY_NAME, U.PHONE_NUMBER, U.ADDRESS, U.CITY, U.COUNTRY, UP.OPEN_FROM, UP.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, UP.STOCK_UPDATE AS LAST_UPDATE FROM DASH5082.CHEMO_MEDICINE M JOIN CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID JOIN DASH5082.CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE M.APPROVED = TRUE AND M.ID =" + data.medicine_id + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_get_all_approved_medicines = function(callback) {
	var query = "SELECT DISTINCT GENERIC_NAME, FORM from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_select_user_by_email = function(data, callback) {
	var query = "SELECT * from DASH5082.CHEMO_USER WHERE EMAIL ='" + data.email + "';";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_select_user_by_id = function(data, callback) {
	var query = "SELECT * from DASH5082.CHEMO_USER WHERE ID ='" + data.user_id + "';";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_select_all_admin = function(callback) {
	var query = "SELECT * from DASH5082.ADMIN ";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_select_pharmacy_by_id = function(data, callback) {
	var query = "SELECT * from DASH5082.CHEMO_USER U JOIN CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE U.ID ='" + data.user_id + "';";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_insert_user = function(data, callback) {
	var query = "INSERT INTO DASH5082.CHEMO_USER (ENTITY_NAME, PERSON_NAME, PERSON_POSITION, EMAIL, PASSWORD, PHONE_NUMBER, ADDRESS, CITY, COUNTRY, TYPE, FIRST_LOGIN, ACTIVE, APPROVE) VALUES ('" + data.entity_name + "', '" + data.name + "', '" + data.position + "', '" + data.email + "', '" + data.password + "', '" + data.phone_number + "', '" + data.address + "', '" + data.city + "', '" + data.country + "', '" + data.type + "', '" + data.first_login + "', '" + data.active + "', '" + data.approve + "')";
	console.log(query);
	return this.dbQuery(query, callback);
};

user_model.prototype.async_update_user_password = function(data, callback) {
	var query = "UPDATE DASH5082.CHEMO_USER SET PASSWORD ='" + data.password + "', UPDATED_AT=CURRENT_TIMESTAMP WHERE ID =" + data.user_id + ";";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_select_users_approval_option = function(data, callback) {
	var query = "SELECT * from DASH5082.CHEMO_USER WHERE APPROVE='" + data.approve + "'";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_update_user_approve = function(data, callback) {
	var query = "UPDATE DASH5082.CHEMO_USER SET APPROVE='" + data.approve + "', UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=" + data.user_id + ";";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_update_user_active = function(data, callback) {
	var query = "UPDATE DASH5082.CHEMO_USER SET ACTIVE='" + data.active + "', UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=" + data.user_id + ";";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_delete_user = function(data, callback) {
	var query = "DELETE FROM DASH5082.CHEMO_USER WHERE ID=" + this.mysql_real_escape_string(data.user_id) + ";";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_update_user_first_password = function(data, callback) {
	var query = "UPDATE DASH5082.CHEMO_USER SET PASSWORD ='" + this.mysql_real_escape_string(data.password) + "', FIRST_LOGIN = '0' WHERE ID =" + this.mysql_real_escape_string(data.user_id) + ";";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_update_user = function(data, callback) {
	query = "UPDATE DASH5082.CHEMO_USER SET EMAIL='" + this.mysql_real_escape_string(data.email) + "', PERSON_NAME ='" + this.mysql_real_escape_string(data.name) + "', PERSON_POSITION ='" + this.mysql_real_escape_string(data.position) + "', ENTITY_NAME='" + this.mysql_real_escape_string(data.entity_name) + "', PHONE_NUMBER ='" + this.mysql_real_escape_string(data.phone_number) + "', ADDRESS ='" + this.mysql_real_escape_string(data.address) + "', CITY ='" + this.mysql_real_escape_string(data.city) + "', COUNTRY ='" + this.mysql_real_escape_string(data.country) + "', UPDATED_AT = CURRENT_TIMESTAMP WHERE ID =" + this.mysql_real_escape_string(data.user_id);
	return this.dbQuery(query, callback);
};

user_model.prototype.async_select_treatment_centers = function(callback) {
	var query = "SELECT * FROM DASH5082.CHEMO_USER WHERE TYPE = 'treatment center'";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_select_treatment_center_by_id = function(data, callback) {
	//var query = "SELECT * FROM DASH5082.CHEMO_USER U JOIN DASH5082.CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE U.TYPE = 'treatment center' AND U.ID=" + this.mysql_real_escape_string(data.user_id);
	var query = "SELECT U.ID, U.ENTITY_NAME, U.PERSON_NAME, U.PERSON_POSITION, U.EMAIL, U.PHONE_NUMBER, U.ADDRESS, U.CITY, U.COUNTRY, U.PASSWORD, U.TYPE, U.APPROVE, U.ACTIVE, U.FIRST_LOGIN, U.CREATED_AT, VARCHAR_FORMAT(U.UPDATED_AT, 'DD/MM/YYYY') AS UPDATED_AT, UP.PHARMACY_ID, CHAR(UP.OPEN_FROM, USA) as OPEN_FROM, CHAR(UP.OPEN_TO,USA) as OPEN_TO , VARCHAR_FORMAT(UP.STOCK_UPDATE, 'DD/MM/YYYY') AS STOCK_UPDATE FROM DASH5082.CHEMO_USER U JOIN DASH5082.CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE U.TYPE = 'treatment center' AND U.ID=" + this.mysql_real_escape_string(data.user_id);
	return this.dbQuery(query, callback);
};

user_model.prototype.async_select_pharmacies_by_medicine_and_quantity = function(data, callback) {
	var query = "SELECT U.ID AS ID, U.EMAIL, U.ENTITY_NAME, U.PHONE_NUMBER, U.ADDRESS, U.CITY, U.COUNTRY, UP.OPEN_FROM, UP.OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, UP.STOCK_UPDATE AS LAST_UPDATE FROM DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID JOIN DASH5082.CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE M.APPROVED = TRUE AND U.TYPE='pharmacy' AND M.ID =" + this.mysql_real_escape_string(data.medicine_id) + " AND S.AVAILABLE_STOCK >=" + this.mysql_real_escape_string(data.quantity) + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)";
	return this.dbQuery(query, callback);
};

user_model.prototype.async_select_pharmacies_by_medicine_and_quantity_and_price = function(data, callback) {
	var query = "SELECT U.ID AS ID, U.EMAIL, U.ENTITY_NAME, U.PHONE_NUMBER, U.ADDRESS, U.CITY, U.COUNTRY, CHAR(UP.OPEN_FROM, USA) as OPEN_FROM, CHAR(UP.OPEN_TO, USA) as OPEN_TO, S.PRICE_PER_PACK, S.EXPIRY_DATE, S.PACK_SIZE, VARCHAR_FORMAT(UP.STOCK_UPDATE, 'DD/MM/YYYY') AS LAST_UPDATE FROM DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID JOIN DASH5082.CHEMO_USER_PHARMACY UP ON U.ID = UP.PHARMACY_ID WHERE M.APPROVED = TRUE AND U.TYPE='pharmacy' AND M.ID =" + this.mysql_real_escape_string(data.medicine_id) + " AND S.PRICE_PER_PACK =" + this.mysql_real_escape_string(data.price) + " AND S.AVAILABLE_STOCK >=" + this.mysql_real_escape_string(data.quantity) + " ORDER BY CAST(S.PRICE_PER_PACK AS DECIMAL)";
	return this.dbQuery(query, callback);
};


module.exports = new user_model();
