model 					= require('./model');
var format = require('string-format');
var medicine_model 			= function(){ };
medicine_model.prototype.constructor  	= medicine_model;
medicine_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


medicine_model.prototype.select_approved_medicines_distinct_generic_name = function() {
	var query = "SELECT DISTINCT GENERIC_NAME, FORM from DASH5082.CHEMO_MEDICINE WHERE APPROVED = TRUE";
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_approved_medicines = function() {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE APPROVED = TRUE";
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_non_approved_medicines = function() {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE APPROVED = FALSE";
	return this.dbQuerySync(query);
};


medicine_model.prototype.select_non_approved_medicines_DESC = function() {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE APPROVED = FALSE order by UPDATED_AT DESC";
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_medicine_by_main_keys = function(data) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND BRAND_NAME = '" + this.mysql_real_escape_string(data.brand_name) + "' AND FORM = '" + this.mysql_real_escape_string(data.form) + "' AND STRENGTH = '" + this.mysql_real_escape_string(data.strength) + "' AND STRENGTH_UNIT = '" + this.mysql_real_escape_string(data.strength_unit) + "' AND MANUFACTURER = '" + this.mysql_real_escape_string(data.manufacturer) + "';";
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_sra_medicine_by_main_keys_collection = function(data) {
	var query = "";
	for(var i=0; i<data.length; i++){
			 query = query.concat("SELECT count(*) as MCOUNT from DASH5082.CHEMO_MEDICINE WHERE GENERIC_NAME ='" + this.mysql_real_escape_string(data[i].generic_name) + "' AND BRAND_NAME = '" + this.mysql_real_escape_string(data[i].brand_name) + "' AND FORM = '" + this.mysql_real_escape_string(data[i].form) + "' AND STRENGTH = '" + this.mysql_real_escape_string(data[i].strength) + "' AND STRENGTH_UNIT = '" + this.mysql_real_escape_string(data[i].strength_unit) + "' AND MANUFACTURER = '" + this.mysql_real_escape_string(data[i].manufacturer) + "';");
	}
	console.log("collection database query is " + data.length);
	//console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.update_insert_sra_medicine_by_main_keys_collection = function(m_insert, m_update){
	var query = "";
	for(var i=0; i<m_insert.length; i++){
		query = query.concat( "INSERT INTO DASH5082.CHEMO_MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, ROUTE, MANUFACTURER, SRA, APPROVAL_DATE, SOURCE, EXTRACT_DATE, SPECIFICATION_FORM, PACK_TYPE, UNITS_PER_PACK, APPROVED, STATUS, COMMENTS, SRA_APPROVED) VALUES ('" + this.mysql_real_escape_string(m_insert[i].generic_name) + "','" + this.mysql_real_escape_string(m_insert[i].brand_name) + "','" + this.mysql_real_escape_string(m_insert[i].form) + "','" + this.mysql_real_escape_string(m_insert[i].strength) + "','" + this.mysql_real_escape_string(m_insert[i].strength_unit) + "','" + this.mysql_real_escape_string(m_insert[i].route) + "','" + this.mysql_real_escape_string(m_insert[i].manufacturer) + "','" + this.mysql_real_escape_string(m_insert[i].sra) + "','" + this.mysql_real_escape_string(m_insert[i].approval_date) + "','" + this.mysql_real_escape_string(m_insert[i].source) + "','" + this.mysql_real_escape_string(m_insert[i].extract_date) + "', '" + this.mysql_real_escape_string(m_insert[i].specification_form) + "', '" + this.mysql_real_escape_string(m_insert[i].pack_type) + "', " + this.mysql_real_escape_string(m_insert[i].units_per_pack) + ", TRUE" + ", '" + this.mysql_real_escape_string(m_insert[i].status) + "', '" + this.mysql_real_escape_string(m_insert[i].comments) + "', TRUE);");
	}

	//console.log("insertion query is " + query);
	for(var i=0; i<m_update.length; i++){
		query = query.concat( "UPDATE DASH5082.CHEMO_MEDICINE SET GENERIC_NAME = '" + this.mysql_real_escape_string(m_update[i].generic_name) + "', BRAND_NAME = '" + this.mysql_real_escape_string(m_update[i].brand_name) + "', FORM = '" + this.mysql_real_escape_string(m_update[i].form) + "', STRENGTH = '" + this.mysql_real_escape_string(m_update[i].strength) + "', STRENGTH_UNIT = '" + this.mysql_real_escape_string(m_update[i].strength_unit) + "', ROUTE = '" + this.mysql_real_escape_string(m_update[i].route) + "', MANUFACTURER = '" + this.mysql_real_escape_string(m_update[i].manufacturer) + "', SRA = '" + this.mysql_real_escape_string(m_update[i].sra) + "', APPROVAL_DATE = '" + this.mysql_real_escape_string(m_update[i].approval_date) + "', SOURCE = '" + this.mysql_real_escape_string(m_update[i].source) + "', EXTRACT_DATE = '" + this.mysql_real_escape_string(m_update[i].extract_date) + "', SPECIFICATION_FORM = '" + this.mysql_real_escape_string(m_update[i].specification_form) + "', PACK_TYPE = '" + this.mysql_real_escape_string(m_update[i].pack_type) + "', UNITS_PER_PACK = " + this.mysql_real_escape_string(m_update[i].units_per_pack) + ", APPROVED = TRUE" + ", STATUS = '" + this.mysql_real_escape_string(m_update[i].status) + "', COMMENTS = '" + this.mysql_real_escape_string(m_update[i].comments) + "', UPDATED_AT = CURRENT_TIMESTAMP, SRA_APPROVED = TRUE" + " WHERE GENERIC_NAME ='" + this.mysql_real_escape_string(m_update[i].generic_name) + "' AND BRAND_NAME = '" + this.mysql_real_escape_string(m_update[i].brand_name) + "' AND FORM = '" + this.mysql_real_escape_string(m_update[i].form) + "' AND STRENGTH = '" + this.mysql_real_escape_string(m_update[i].strength) + "' AND STRENGTH_UNIT = '" + this.mysql_real_escape_string(m_update[i].strength_unit) + "' AND MANUFACTURER = '" + this.mysql_real_escape_string(m_update[i].manufacturer) + "';");
	}
	console.log("collection database query for insertion is " + m_insert.length);
	console.log("collection database query for update is " + m_update.length);
	//console.log(query);
	return this.dbQuerySync(query);
}

medicine_model.prototype.insert_new_medicine = function(data) {
	var query = "INSERT INTO DASH5082.CHEMO_MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, ROUTE, MANUFACTURER, SRA, APPROVAL_DATE, SOURCE, EXTRACT_DATE, SPECIFICATION_FORM, PACK_TYPE, UNITS_PER_PACK, APPROVED, STATUS, COMMENTS, SRA_APPROVED) VALUES ('" + this.mysql_real_escape_string(data.generic_name) + "','" + this.mysql_real_escape_string(data.brand_name) + "','" + this.mysql_real_escape_string(data.form) + "','" + this.mysql_real_escape_string(data.strength) + "','" + this.mysql_real_escape_string(data.strength_unit) + "','" + this.mysql_real_escape_string(data.route) + "','" + this.mysql_real_escape_string(data.manufacturer) + "','" + this.mysql_real_escape_string(data.sra) + "','" + this.mysql_real_escape_string(data.approval_date) + "','" + this.mysql_real_escape_string(data.source) + "','" + this.mysql_real_escape_string(data.extract_date) + "', '" + this.mysql_real_escape_string(data.specification_form) + "', '" + this.mysql_real_escape_string(data.pack_type) + "', " + this.mysql_real_escape_string(data.units_per_pack) + ", " + this.mysql_real_escape_string(data.approve) + ", '" + this.mysql_real_escape_string(data.status) + "', '" + this.mysql_real_escape_string(data.comments) + "'," + this.mysql_real_escape_string(data.b_rsa_approve) + ");";
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_medicine_by_id = function(data) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE ID =" + this.mysql_real_escape_string(data.medicine_id);
	return this.dbQuerySync(query);
};

medicine_model.prototype.disapprove_rsa = function() {
	var query = "UPDATE DASH5082.CHEMO_MEDICINE SET SRA_APPROVED = FALSE, APPROVED = FALSE where SRA_APPROVED = TRUE;";
	return this.dbQuerySync(query);
};

medicine_model.prototype.update_medicine = function(data) {
	var query = "UPDATE DASH5082.CHEMO_MEDICINE SET GENERIC_NAME = '" + this.mysql_real_escape_string(data.generic_name) + "', BRAND_NAME = '" + this.mysql_real_escape_string(data.brand_name) + "', FORM = '" + this.mysql_real_escape_string(data.form) + "', STRENGTH = '" + this.mysql_real_escape_string(data.strength) + "', STRENGTH_UNIT = '" + this.mysql_real_escape_string(data.strength_unit) + "', ROUTE = '" + this.mysql_real_escape_string(data.route) + "', MANUFACTURER = '" + this.mysql_real_escape_string(data.manufacturer) + "', SRA = '" + this.mysql_real_escape_string(data.sra) + "', APPROVAL_DATE = '" + this.mysql_real_escape_string(data.approval_date) + "', SOURCE = '" + this.mysql_real_escape_string(data.source) + "', EXTRACT_DATE = '" + this.mysql_real_escape_string(data.extract_date) + "', SPECIFICATION_FORM = '" + this.mysql_real_escape_string(data.specification_form) + "', PACK_TYPE = '" + this.mysql_real_escape_string(data.pack_type) + "', UNITS_PER_PACK = " + this.mysql_real_escape_string(data.units_per_pack) + ", APPROVED = " + this.mysql_real_escape_string(data.approve) + ", STATUS = '" + this.mysql_real_escape_string(data.status) + "', COMMENTS = '" + this.mysql_real_escape_string(data.comments) + "', UPDATED_AT = CURRENT_TIMESTAMP, SRA_APPROVED = " + this.mysql_real_escape_string(data.b_rsa_approve) + " WHERE ID = " + this.mysql_real_escape_string(data.medicine_id) + ";";
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.delete_medicine = function(data) {
	var query = "DELETE FROM DASH5082.CHEMO_MEDICINE WHERE ID =" + this.mysql_real_escape_string(data.medicine_id);
	return this.dbQuerySync(query);
};

medicine_model.prototype.insert_new_medicine_by_main_keys = function(data) {
	var query = "INSERT INTO DASH5082.CHEMO_MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, MANUFACTURER) VALUES ('" + this.mysql_real_escape_string(data.generic_name) + "','" + this.mysql_real_escape_string(data.brand_name) + "','" + this.mysql_real_escape_string(data.form) + "','" + this.mysql_real_escape_string(data.strength) + "','" + this.mysql_real_escape_string(data.strength_unit) + "','" + this.mysql_real_escape_string(data.manufacturer) + "');";
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_medicine_by_generic_and_form = function(data) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND FORM = '" + this.mysql_real_escape_string(data.form) + "' AND APPROVED = TRUE;";
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_all_medicine_by_generic_and_form = function(data) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE upper(GENERIC_NAME) ='" + this.mysql_upper_case_real_escape_string(data.generic_name) + "' AND upper(FORM) = '" + this.mysql_upper_case_real_escape_string(data.form) + "';";
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_medicine_by_generic_and_form_grouped_by_price = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_MEDICINE AS G1 JOIN (SELECT SL.MEDICINE_ID, SL.PRICE_PER_PACK from DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST SL ON M.ID = SL.MEDICINE_ID WHERE M.GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND M.FORM = '" + this.mysql_real_escape_string(data.form) + "' AND APPROVED = TRUE AND SL.AVAILABLE_STOCK > 0 GROUP BY SL.MEDICINE_ID, SL.PRICE_PER_PACK ORDER BY SL.PRICE_PER_PACK) AS G2 ON G2.MEDICINE_ID = G1.ID";
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_medicine_by_generic_and_form_in_pharmacies = function(data) {
	var query = "SELECT DISTINCT SL.MEDICINE_ID, M.* from DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST SL ON M.ID = SL.MEDICINE_ID WHERE M.GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND M.FORM = '" + this.mysql_real_escape_string(data.form) + "' AND APPROVED = TRUE AND SL.AVAILABLE_STOCK > 0";
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_medicine_not_in_treatment_center = function(data) {
	//var query = "SELECT DISTINCT GENERIC_NAME, FORM FROM DASH5082.CHEMO_MEDICINE WHERE APPROVED = TRUE AND (GENERIC_NAME, FORM) NOT IN (SELECT DISTINCT M.GENERIC_NAME, FORM FROM DASH5082.CHEMO_MEDICINE M JOIN CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID WHERE U.ID = "  + this.mysql_real_escape_string(data.user_id) + ") ORDER BY GENERIC_NAME";
	var query = "SELECT *, SL.ID AS STOCK_LIST_ID FROM DASH5082.CHEMO_STOCK_LIST SL JOIN DASH5082.CHEMO_MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE SL.PHARMACY_ID = " + this.mysql_real_escape_string(data.user_id)+ " AND SL.AVAILABLE_STOCK = "+ 0 ;
	return this.dbQuerySync(query);
};

medicine_model.prototype.select_approved_medicine_by_id = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_MEDICINE WHERE APPROVED = TRUE AND ID=" + this.mysql_real_escape_string(data.medicine_id);
	return this.dbQuerySync(query);
};

medicine_model.prototype.update_medicine_approval = function(data) {
	var query = "UPDATE DASH5082.CHEMO_MEDICINE SET SRA = '', APPROVED = " + this.mysql_real_escape_string(data.approve) + ", UPDATED_AT = CURRENT_TIMESTAMP WHERE ID = " + this.mysql_real_escape_string(data.medicine_id) + ";";
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.insert_rows_stock_list_transaction_history = function(data) {
	fquery = "INSERT INTO DASH5082.CHEMO_STOCK_LIST_TRANSACTION_HISTORY (TRANSACTION_TYPE ,ID,MEDICINE_ID ,BATCH_NUMBER ,EXPIRY_DATE ,PACK_SIZE,PRICE_PER_PACK,AVAILABLE_STOCK,AVG_MONTHLY_CONSUMPTION,PHARMACY_ID,CREATED_AT,UPDATED_AT ) select 'stock_upload', ID,MEDICINE_ID ,BATCH_NUMBER ,EXPIRY_DATE, PACK_SIZE,PRICE_PER_PACK, AVAILABLE_STOCK,AVG_MONTHLY_CONSUMPTION,PHARMACY_ID, CREATED_AT,UPDATED_AT from CHEMO_STOCK_LIST WHERE PHARMACY_ID = '{0}' and AVAILABLE_STOCK > 0";
	query = format(fquery, data.pharmacy_id);
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.insert_rows_out_of_stock_list_transaction_history = function(data) {
	fquery = "INSERT INTO DASH5082.CHEMO_STOCK_LIST_TRANSACTION_HISTORY (TRANSACTION_TYPE ,ID,MEDICINE_ID ,BATCH_NUMBER ,EXPIRY_DATE ,PACK_SIZE,PRICE_PER_PACK,AVAILABLE_STOCK,AVG_MONTHLY_CONSUMPTION,PHARMACY_ID,CREATED_AT,UPDATED_AT ) select 'stock_upload', ID,MEDICINE_ID ,BATCH_NUMBER ,EXPIRY_DATE, PACK_SIZE,PRICE_PER_PACK, AVAILABLE_STOCK,AVG_MONTHLY_CONSUMPTION,PHARMACY_ID, CREATED_AT,UPDATED_AT from CHEMO_STOCK_LIST WHERE PHARMACY_ID = '{0}' and AVAILABLE_STOCK = 0";
	query = format(fquery, data.pharmacy_id);
  console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.delete_rows_stock_list_by_pharmacy_id = function(data) {
	fquery = "DELETE FROM DASH5082.CHEMO_STOCK_LIST WHERE PHARMACY_ID = '{0}' and AVAILABLE_STOCK > 0";
	query = format(fquery, data.pharmacy_id);
	console.log(query);
	return this.dbQuerySync(query);
};

medicine_model.prototype.delete_rows_out_of_stock_list_by_pharmacy_id = function(data) {
	fquery = "DELETE FROM DASH5082.CHEMO_STOCK_LIST WHERE PHARMACY_ID = '{0}' and AVAILABLE_STOCK = 0";
	query = format(fquery, data.pharmacy_id);
	console.log(query);
	return this.dbQuerySync(query);
}
//+++++++++++++++++++++++ASYNC+++++++++++++++++++++++++++++++++++

medicine_model.prototype.async_select_approved_medicines_distinct_generic_name = function(callback) {
	var query = "SELECT DISTINCT GENERIC_NAME, FORM from DASH5082.CHEMO_MEDICINE WHERE APPROVED = TRUE";
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_SRA_approved_medicines_distinct_generic_name = function(callback) {
	var query = "SELECT DISTINCT GENERIC_NAME, FORM from DASH5082.CHEMO_MEDICINE WHERE APPROVED = TRUE and SRA_APPROVED = TRUE";
	return this.dbQuery(query, callback);
};
medicine_model.prototype.async_select_approved_medicines = function(callback) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE APPROVED = TRUE";
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_non_approved_medicines = function(callback) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE APPROVED = FALSE";
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_medicine_by_main_keys = function(data, callback) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE upper(GENERIC_NAME) ='" + this.mysql_upper_case_real_escape_string(data.generic_name) + "' AND upper(BRAND_NAME) = '" + this.mysql_upper_case_real_escape_string(data.brand_name) + "' AND upper(FORM) = '" + this.mysql_upper_case_real_escape_string(data.form) + "' AND STRENGTH = '" + this.mysql_real_escape_string(data.strength) + "' AND upper(STRENGTH_UNIT) = '" + this.mysql_upper_case_real_escape_string(data.strength_unit) + "' AND upper(MANUFACTURER) = '" + this.mysql_upper_case_real_escape_string(data.manufacturer) + "';";
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_sra_medicine_by_main_keys = function(data, callback) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND BRAND_NAME = '" + this.mysql_real_escape_string(data.brand_name) + "' AND FORM = '" + this.mysql_real_escape_string(data.form) + "' AND STRENGTH = '" + this.mysql_real_escape_string(data.strength) + "' AND STRENGTH_UNIT = '" + this.mysql_real_escape_string(data.strength_unit) + "' AND MANUFACTURER = '" + this.mysql_real_escape_string(data.manufacturer) + "';";
	return this.dbQueryPool(query, callback);
};

medicine_model.prototype.async_insert_new_medicine = function(data, callback) {
	var query = "INSERT INTO DASH5082.CHEMO_MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, ROUTE, MANUFACTURER, SRA, APPROVAL_DATE, SOURCE, EXTRACT_DATE, SPECIFICATION_FORM, PACK_TYPE, UNITS_PER_PACK, APPROVED, STATUS, COMMENTS) VALUES ('" + this.mysql_real_escape_string(data.generic_name) + "','" + this.mysql_real_escape_string(data.brand_name) + "','" + this.mysql_real_escape_string(data.form) + "','" + this.mysql_real_escape_string(data.strength) + "','" + this.mysql_real_escape_string(data.strength_unit) + "','" + this.mysql_real_escape_string(data.route) + "','" + this.mysql_real_escape_string(data.manufacturer) + "','" + this.mysql_real_escape_string(data.sra) + "','" + this.mysql_real_escape_string(data.approval_date) + "','" + this.mysql_real_escape_string(data.source) + "','" + this.mysql_real_escape_string(data.extract_date) + "', '" + this.mysql_real_escape_string(data.specification_form) + "', '" + this.mysql_real_escape_string(data.pack_type) + "', " + this.mysql_real_escape_string(data.units_per_pack) + ", " + this.mysql_real_escape_string(data.approve) + ", '" + this.mysql_real_escape_string(data.status) + "', '" + this.mysql_real_escape_string(data.comments) + "');";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_insert_rsa_new_medicine = function(data, callback) {
	var query = "INSERT INTO DASH5082.CHEMO_MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, ROUTE, MANUFACTURER, SRA, APPROVAL_DATE, SOURCE, EXTRACT_DATE, SPECIFICATION_FORM, PACK_TYPE, UNITS_PER_PACK, APPROVED, STATUS, COMMENTS, SRA_APPROVED) VALUES ('" + this.mysql_real_escape_string(data.generic_name) + "','" + this.mysql_real_escape_string(data.brand_name) + "','" + this.mysql_real_escape_string(data.form) + "','" + this.mysql_real_escape_string(data.strength) + "','" + this.mysql_real_escape_string(data.strength_unit) + "','" + this.mysql_real_escape_string(data.route) + "','" + this.mysql_real_escape_string(data.manufacturer) + "','" + this.mysql_real_escape_string(data.sra) + "','" + this.mysql_real_escape_string(data.approval_date) + "','" + this.mysql_real_escape_string(data.source) + "','" + this.mysql_real_escape_string(data.extract_date) + "', '" + this.mysql_real_escape_string(data.specification_form) + "', '" + this.mysql_real_escape_string(data.pack_type) + "', " + this.mysql_real_escape_string(data.units_per_pack) + ", " + this.mysql_real_escape_string(data.approve) + ", '" + this.mysql_real_escape_string(data.status) + "', '" + this.mysql_real_escape_string(data.comments) + "'," + this.mysql_real_escape_string(data.b_rsa_approve) + ");";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_medicine_by_id = function(data, callback) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE ID =" + this.mysql_real_escape_string(data.medicine_id);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_update_medicine = function(data, callback) {
	var query = "UPDATE DASH5082.CHEMO_MEDICINE SET GENERIC_NAME = '" + this.mysql_real_escape_string(data.generic_name) + "', BRAND_NAME = '" + this.mysql_real_escape_string(data.brand_name) + "', FORM = '" + this.mysql_real_escape_string(data.form) + "', STRENGTH = '" + this.mysql_real_escape_string(data.strength) + "', STRENGTH_UNIT = '" + this.mysql_real_escape_string(data.strength_unit) + "', ROUTE = '" + this.mysql_real_escape_string(data.route) + "', MANUFACTURER = '" + this.mysql_real_escape_string(data.manufacturer) + "', SRA = '" + this.mysql_real_escape_string(data.sra) + "', APPROVAL_DATE = '" + this.mysql_real_escape_string(data.approval_date) + "', SOURCE = '" + this.mysql_real_escape_string(data.source) + "', EXTRACT_DATE = '" + this.mysql_real_escape_string(data.extract_date) + "', SPECIFICATION_FORM = '" + this.mysql_real_escape_string(data.specification_form) + "', PACK_TYPE = '" + this.mysql_real_escape_string(data.pack_type) + "', UNITS_PER_PACK = " + this.mysql_real_escape_string(data.units_per_pack) + ", APPROVED = " + this.mysql_real_escape_string(data.approve) + ", STATUS = '" + this.mysql_real_escape_string(data.status) + "', COMMENTS = '" + this.mysql_real_escape_string(data.comments) + "', UPDATED_AT = CURRENT_TIMESTAMP WHERE ID = " + this.mysql_real_escape_string(data.medicine_id) + ";";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_SRA_update_medicine = function(data, callback) {
	var query = "UPDATE DASH5082.CHEMO_MEDICINE SET GENERIC_NAME = '" + this.mysql_real_escape_string(data.generic_name) + "', BRAND_NAME = '" + this.mysql_real_escape_string(data.brand_name) + "', FORM = '" + this.mysql_real_escape_string(data.form) + "', STRENGTH = '" + this.mysql_real_escape_string(data.strength) + "', STRENGTH_UNIT = '" + this.mysql_real_escape_string(data.strength_unit) + "', ROUTE = '" + this.mysql_real_escape_string(data.route) + "', MANUFACTURER = '" + this.mysql_real_escape_string(data.manufacturer) + "', SRA = '" + this.mysql_real_escape_string(data.sra) + "', APPROVAL_DATE = '" + this.mysql_real_escape_string(data.approval_date) + "', SOURCE = '" + this.mysql_real_escape_string(data.source) + "', EXTRACT_DATE = '" + this.mysql_real_escape_string(data.extract_date) + "', SPECIFICATION_FORM = '" + this.mysql_real_escape_string(data.specification_form) + "', PACK_TYPE = '" + this.mysql_real_escape_string(data.pack_type) + "', UNITS_PER_PACK = " + this.mysql_real_escape_string(data.units_per_pack) + ", APPROVED = " + this.mysql_real_escape_string(data.approve) + ", STATUS = '" + this.mysql_real_escape_string(data.status) + "', COMMENTS = '" + this.mysql_real_escape_string(data.comments) + "', UPDATED_AT = CURRENT_TIMESTAMP, SRA_APPROVED = " + this.mysql_real_escape_string(data.b_rsa_approve) + " WHERE ID = " + this.mysql_real_escape_string(data.medicine_id) + ";";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_delete_medicine = function(data, callback) {
	var query = "DELETE FROM DASH5082.CHEMO_MEDICINE WHERE ID =" + this.mysql_real_escape_string(data.medicine_id);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_insert_new_medicine_by_main_keys = function(data, callback) {
	var query = "INSERT INTO DASH5082.CHEMO_MEDICINE (GENERIC_NAME, BRAND_NAME, FORM, STRENGTH, STRENGTH_UNIT, MANUFACTURER) VALUES ('" + this.mysql_real_escape_string(data.generic_name) + "','" + this.mysql_real_escape_string(data.brand_name) + "','" + this.mysql_real_escape_string(data.form) + "','" + this.mysql_real_escape_string(data.strength) + "','" + this.mysql_real_escape_string(data.strength_unit) + "','" + this.mysql_real_escape_string(data.manufacturer) + "');";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_medicine_by_generic_and_form = function(data, callback) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND FORM = '" + this.mysql_real_escape_string(data.form) + "' AND APPROVED = TRUE;";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_all_medicine_by_generic_and_form = function(data, callback) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND FORM = '" + this.mysql_real_escape_string(data.form) + "'";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_manufacturer_by_generic_and_form = function(data, callback) {
	var query = "SELECT DISTINCT MANUFACTURER from DASH5082.CHEMO_MEDICINE WHERE GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND FORM = '" + this.mysql_real_escape_string(data.form) + "' AND APPROVED = TRUE;";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_medicine_by_manufacturer_and_generic_and_form = function(data, callback) {
	var query = "SELECT * from DASH5082.CHEMO_MEDICINE WHERE GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND FORM = '" + this.mysql_real_escape_string(data.form) + "' AND MANUFACTURER = '" + this.mysql_real_escape_string(data.manufacturer) + "' AND APPROVED = TRUE;";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_medicine_by_generic_and_form_grouped_by_price = function(data, callback) {
	var query = "SELECT * FROM DASH5082.CHEMO_MEDICINE AS G1 JOIN (SELECT SL.MEDICINE_ID, SL.PRICE_PER_PACK from DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST SL ON M.ID = SL.MEDICINE_ID WHERE M.GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND M.FORM = '" + this.mysql_real_escape_string(data.form) + "' AND APPROVED = TRUE AND SL.AVAILABLE_STOCK > 0 GROUP BY SL.MEDICINE_ID, SL.PRICE_PER_PACK ORDER BY SL.PRICE_PER_PACK) AS G2 ON G2.MEDICINE_ID= G1.ID";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_medicine_by_generic_and_form_and_id_grouped_by_price = function(data, callback) {
	//var query = "SELECT * FROM DASH5082.CHEMO_MEDICINE AS G1 JOIN (SELECT SL.MEDICINE_ID, SL.PRICE_PER_PACK from DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST SL ON M.ID = SL.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = SL.PHARMACY_ID WHERE U.TYPE='pharmacy' AND M.GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND M.FORM = '" + this.mysql_real_escape_string(data.form) + "' AND M.ID = '" + this.mysql_real_escape_string(data.medicine_id) + "' AND APPROVED = TRUE AND SL.AVAILABLE_STOCK > 0 GROUP BY SL.MEDICINE_ID, SL.PRICE_PER_PACK ORDER BY SL.PRICE_PER_PACK) AS G2 ON G2.MEDICINE_ID= G1.ID";

  // ADD back that medicin needs to be APPROVED for the pharmacy added APPROVED = TRUE AND SL.AVAILABLE_STOCK > 0 AND U.TYPE='pharmacy'
	var query = "SELECT * FROM DASH5082.CHEMO_MEDICINE AS G1 JOIN (SELECT SL.MEDICINE_ID, SL.PRICE_PER_PACK from DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST SL ON M.ID = SL.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = SL.PHARMACY_ID WHERE M.GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND M.FORM = '" + this.mysql_real_escape_string(data.form) + "' AND M.ID = '" + this.mysql_real_escape_string(data.medicine_id) + "' AND APPROVED = TRUE AND SL.AVAILABLE_STOCK > 0 AND U.TYPE='pharmacy'  GROUP BY SL.MEDICINE_ID, SL.PRICE_PER_PACK ORDER BY SL.PRICE_PER_PACK) AS G2 ON G2.MEDICINE_ID= G1.ID";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_medicine_by_generic_and_form_in_pharmacies = function(data, callback) {
	var query = "SELECT DISTINCT SL.MEDICINE_ID,SL.PRICE_PER_PACK, M.* from DASH5082.CHEMO_MEDICINE M JOIN DASH5082.CHEMO_STOCK_LIST SL ON M.ID = SL.MEDICINE_ID WHERE M.GENERIC_NAME ='" + this.mysql_real_escape_string(data.generic_name) + "' AND M.FORM = '" + this.mysql_real_escape_string(data.form) + "' AND APPROVED = TRUE AND SL.AVAILABLE_STOCK > 0";
	console.log(query);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_medicine_not_in_treatment_center = function(data, callback) {
	//var query = "SELECT DISTINCT GENERIC_NAME, FORM FROM DASH5082.CHEMO_MEDICINE WHERE APPROVED = TRUE AND (GENERIC_NAME, FORM) NOT IN (SELECT DISTINCT M.GENERIC_NAME, FORM FROM DASH5082.CHEMO_MEDICINE M JOIN CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID WHERE U.ID = "  + this.mysql_real_escape_string(data.user_id) + ") ORDER BY GENERIC_NAME";
	var query = "SELECT *, SL.ID AS STOCK_LIST_ID FROM DASH5082.CHEMO_STOCK_LIST SL JOIN DASH5082.CHEMO_MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE SL.PHARMACY_ID = " + this.mysql_real_escape_string(data.user_id)+ " AND SL.AVAILABLE_STOCK = 0" ;
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_select_distinct_medicine_not_in_treatment_center = function(data, callback) {
	//var query = "SELECT DISTINCT GENERIC_NAME, FORM FROM DASH5082.CHEMO_MEDICINE WHERE APPROVED = TRUE AND (GENERIC_NAME, FORM) NOT IN (SELECT DISTINCT M.GENERIC_NAME, FORM FROM DASH5082.CHEMO_MEDICINE M JOIN CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID WHERE U.ID = "  + this.mysql_real_escape_string(data.user_id) + ") ORDER BY GENERIC_NAME";
	var query = "SELECT distinct generic_name , M.form FROM DASH5082.CHEMO_STOCK_LIST SL JOIN DASH5082.CHEMO_MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE SL.PHARMACY_ID = " + this.mysql_real_escape_string(data.user_id)+ " AND SL.AVAILABLE_STOCK = 0" ;
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_count_medicine_not_in_treatment_center = function(data, callback) {
	//var query = "SELECT DISTINCT GENERIC_NAME, FORM FROM DASH5082.CHEMO_MEDICINE WHERE APPROVED = TRUE AND (GENERIC_NAME, FORM) NOT IN (SELECT DISTINCT M.GENERIC_NAME, FORM FROM DASH5082.CHEMO_MEDICINE M JOIN CHEMO_STOCK_LIST S ON M.ID = S.MEDICINE_ID JOIN DASH5082.CHEMO_USER U ON U.ID = S.PHARMACY_ID WHERE U.ID = "  + this.mysql_real_escape_string(data.user_id) + ") ORDER BY GENERIC_NAME";
	var query = "SELECT * FROM DASH5082.CHEMO_STOCK_LIST SL  WHERE SL.PHARMACY_ID = " + this.mysql_real_escape_string(data.user_id)+ " AND SL.AVAILABLE_STOCK = 0" ;
	return this.dbQuery(query, callback);
};


medicine_model.prototype.async_select_approved_medicine_by_id = function(data, callback) {
	var query = "SELECT * FROM DASH5082.CHEMO_MEDICINE WHERE ID=" + this.mysql_real_escape_string(data.medicine_id);
	return this.dbQuery(query, callback);
};

medicine_model.prototype.async_update_medicine_approval = function(data, callback) {
	var query = "UPDATE DASH5082.CHEMO_MEDICINE SET SRA = '', APPROVED = " + this.mysql_real_escape_string(data.approve) + ", UPDATED_AT = CURRENT_TIMESTAMP WHERE ID = " + this.mysql_real_escape_string(data.medicine_id) + ";";
	return this.dbQuery(query, callback);
};


module.exports = new medicine_model();
