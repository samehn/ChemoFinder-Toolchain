model 					= require('./model');
var medicine_model 			= function(){ };
medicine_model.prototype.constructor  	= medicine_model;
medicine_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


medicine_model.prototype.select_approved_medicines_distinct_generic_name = function() {
	var query = "SELECT DISTINCT GENERIC_NAME, FORM from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_approved_medicines = function() {
	var query = "SELECT * from DASH5082.MEDICINE WHERE SRA IS NOT NULL";
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_non_approved_medicines = function() {
	var query = "SELECT * from DASH5082.MEDICINE WHERE SRA IS NULL";
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_medicine_by_main_keys = function(data) {
	var query = "SELECT * from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + data.generic_name + "' AND BRAND_NAME = '" + data.brand_name + "' AND FORM = '" + data.form + "' AND STRENGTH = '" + data.strength + "' AND STRENGTH_UNIT = '" + data.strength_unit + "' AND MANUFACTURER = '" + data.manufacturer + "';"; 
	return this.dbQuerySync(query);
};

medicine_model.prototype.insert_new_medicine = function(data) {
	var query = "INSERT INTO DASH5082.MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, ROUTE, MANUFACTURER, SRA, APPROVAL_DATE, SOURCE, EXTRACT_DATE) VALUES ('" + data.generic_name + "','" + data.brand_name + "','" + data.form + "','" + data.strength + "','" + data.strength_unit + "','" + data.route + "','" + data.manufacturer + "','" + data.sra + "','" + data.approval_date + "','" + data.source + "','" + data.extract_date + "');";
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_medicine_by_id = function(data) {
	var query = "SELECT * from DASH5082.MEDICINE WHERE ID =" + data.medicine_id;
	return this.dbQuerySync(query);
};

medicine_model.prototype.update_medicine = function(data) {
	var query = "UPDATE DASH5082.MEDICINE SET GENERIC_NAME = '" + data.generic_name + "', BRAND_NAME = '" + data.brand_name + "', FORM = '" + data.form + "', STRENGTH = '" + data.strength + "', STRENGTH_UNIT = '" + data.strength_unit + "', ROUTE = '" + data.route + "', MANUFACTURER = '" + data.manufacturer + "', SRA = '" + data.sra + "', APPROVAL_DATE = '" + data.approval_date + "', SOURCE = '" + data.source + "', EXTRACT_DATE = '" + data.extract_date + "' WHERE ID = " + data.medicine_id + ";";
	return this.dbQuerySync(query);
};

medicine_model.prototype.delete_medicine = function(data) {
	var query = "DELETE FROM DASH5082.MEDICINE WHERE ID =" + data.medicine_id;
	return this.dbQuerySync(query);
};

medicine_model.prototype.insert_new_medicine_by_main_keys = function(data) {
	var query = "INSERT INTO DASH5082.MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, MANUFACTURER, SRA) VALUES ('" + data.generic_name + "','" + data.brand_name + "','" + data.form + "','" + data.strength + "','" + data.strength_unit + "','" + data.manufacturer + "', NULL);";
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_medicine_by_generid_and_form = function(data) {
	var query = "SELECT * from DASH5082.MEDICINE WHERE GENERIC_NAME ='" + data.generic_name + "' AND FORM = '" + data.form + "';";
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_medicine_not_in_treatment_center = function(data) {
	var query = "SELECT DISTINCT GENERIC_NAME, FORM FROM MEDICINE WHERE SRA IS NOT NULL AND (GENERIC_NAME, FORM) NOT IN (SELECT DISTINCT M.GENERIC_NAME, FORM FROM DASH5082.MEDICINE M JOIN STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN USER U ON U.ID = S.PHARMACY_ID WHERE U.ID = "  + data.user_id + ")";
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_approved_medicine_by_id = function(data) {
	var query = "SELECT * FROM DASH5082.MEDICINE WHERE SRA IS NOT NULL AND ID=" + data.medicine_id;
	return this.dbQuerySync(query);
};

module.exports = new medicine_model();
