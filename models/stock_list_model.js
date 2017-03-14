model 					= require('./model');
var stock_list_model 			= function(){ };
stock_list_model.prototype.constructor  	= stock_list_model;
stock_list_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

stock_list_model.prototype.select_stock_list_by_id = function(data) {
	var query = "SELECT *, SL.ID AS STOCK_LIST_ID FROM DASH5082.CHEMO_STOCK_LIST SL JOIN DASH5082.CHEMO_MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE SL.PHARMACY_ID = " + this.mysql_real_escape_string(data.user_id);
	return this.dbQuerySync(query);
};

stock_list_model.prototype.select_stock_list_record_by_id = function(data) {
	var query = "SELECT M.GENERIC_NAME, M.BRAND_NAME, M.FORM, M.STRENGTH, M.STRENGTH_UNIT, M.MANUFACTURER, SL.BATCH_NUMBER, SL.EXPIRY_DATE, M.SRA, SL.PACK_SIZE, SL.PRICE_PER_PACK, SL.AVAILABLE_STOCK, SL.AVG_MONTHLY_CONSUMPTION, M.SPECIFICATION_FORM, M.PACK_TYPE, M.UNITS_PER_PACK, M.APPROVED, SL.UPDATED_AT AS LAST_UPDATE FROM DASH5082.CHEMO_STOCK_LIST SL JOIN DASH5082.CHEMO_MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE SL.ID =" + this.mysql_real_escape_string(data.stock_id) + " AND SL.PHARMACY_ID =" + this.mysql_real_escape_string(data.user_id) + ";";
	return this.dbQuerySync(query);
};

stock_list_model.prototype.select_stock_list_by_medicine = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_STOCK_LIST WHERE MEDICINE_ID = " + this.mysql_real_escape_string(data.medicine_id) + " AND PHARMACY_ID = " + this.mysql_real_escape_string(data.user_id);
	return this.dbQuerySync(query);
};

stock_list_model.prototype.insert_new_record = function(data) {
	var query = "INSERT INTO DASH5082.CHEMO_STOCK_LIST (MEDICINE_ID, BATCH_NUMBER, EXPIRY_DATE, PACK_SIZE, PRICE_PER_PACK, AVAILABLE_STOCK, AVG_MONTHLY_CONSUMPTION, PHARMACY_ID) VALUES (" + this.mysql_real_escape_string(data.medicine_id) + ",'" + this.mysql_real_escape_string(data.batch_number) + "', '" + this.mysql_real_escape_string(data.expiry_date) + "', " + this.mysql_real_escape_string(data.pack_size) + "," + this.mysql_real_escape_string(data.price) + "," + this.mysql_real_escape_string(data.quantity) + ", '" + this.mysql_real_escape_string(data.avg_monthly_consumption) + "', " + this.mysql_real_escape_string(data.user_id) + ");";
	return this.dbQuerySync(query);
};

stock_list_model.prototype.select_stock_record_by_id = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_STOCK_LIST WHERE ID = " + this.mysql_real_escape_string(data.stock_id);
	return this.dbQuerySync(query);
};

stock_list_model.prototype.select_stock_record_by_pharmacy = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_STOCK_LIST WHERE ID =" + this.mysql_real_escape_string(data.stock_id) + " AND PHARMACY_ID =" + this.mysql_real_escape_string(data.user_id);
	return this.dbQuerySync(query);
};

stock_list_model.prototype.update_stock_record = function(data) {
	var query = "UPDATE DASH5082.CHEMO_STOCK_LIST SET BATCH_NUMBER = '" + this.mysql_real_escape_string(data.batch_number) + "', EXPIRY_DATE = '" + this.mysql_real_escape_string(data.expiry_date) + "', PACK_SIZE = " + this.mysql_real_escape_string(data.pack_size) + ", PRICE_PER_PACK = " + this.mysql_real_escape_string(data.price) + ", AVAILABLE_STOCK = " + this.mysql_real_escape_string(data.quantity) + ", AVG_MONTHLY_CONSUMPTION = '" + this.mysql_real_escape_string(data.avg_monthly_consumption) + "', UPDATED_AT = CURRENT_TIMESTAMP WHERE ID =" + this.mysql_real_escape_string(data.stock_id) + " AND PHARMACY_ID =" + this.mysql_real_escape_string(data.user_id);
	console.log(query);
	return this.dbQuerySync(query);
};

stock_list_model.prototype.delete_stock_record = function(data) {
	var query = "DELETE FROM DASH5082.CHEMO_STOCK_LIST WHERE ID =" + this.mysql_real_escape_string(data.stock_id) + " AND PHARMACY_ID =" + this.mysql_real_escape_string(data.user_id);
	return this.dbQuerySync(query);
};

stock_list_model.prototype.select_stocks_by_medicine_id = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_STOCK_LIST WHERE MEDICINE_ID = " + this.mysql_real_escape_string(data.medicine_id);
	return this.dbQuerySync(query);
};

module.exports = new stock_list_model();
