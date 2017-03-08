model 					= require('./model');
var stock_list_model 			= function(){ };
stock_list_model.prototype.constructor  	= stock_list_model;
stock_list_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

stock_list_model.prototype.select_stock_list_by_id = function(data) {
	var query = "SELECT *, SL.ID AS STOCK_LIST_ID FROM DASH5082.CHEMO_STOCK_LIST SL JOIN DASH5082.CHEMO_MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE SL.PHARMACY_ID = " + data.user_id;
	return this.dbQuerySync(query);
};

stock_list_model.prototype.select_stock_list_record_by_id = function(data) {
	var query = "SELECT M.GENERIC_NAME, M.BRAND_NAME, M.FORM, M.STRENGTH, M.STRENGTH_UNIT, M.MANUFACTURER, SL.BATCH_NUMBER, SL.EXPIRY_DATE, M.SRA, SL.PACK_SIZE, SL.PRICE_PER_PACK, SL.AVAILABLE_STOCK, SL.AVG_MONTHLY_CONSUMPTION, M.SPECIFICATION_FORM, M.PACK_TYPE, M.UNITS_PER_PACK, M.APPROVED, SL.UPDATED_AT AS LAST_UPDATE FROM DASH5082.CHEMO_STOCK_LIST SL JOIN DASH5082.CHEMO_MEDICINE M ON SL.MEDICINE_ID = M.ID WHERE SL.ID =" + data.stock_id + " AND SL.PHARMACY_ID =" + data.user_id + ";";
	return this.dbQuerySync(query);
};

stock_list_model.prototype.select_stock_list_by_medicine = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_STOCK_LIST WHERE MEDICINE_ID = " + data.medicine_id + " AND PHARMACY_ID = " + data.user_id;
	return this.dbQuerySync(query);
};

stock_list_model.prototype.insert_new_record = function(data) {
	var query = "INSERT INTO DASH5082.CHEMO_STOCK_LIST (MEDICINE_ID, BATCH_NUMBER, EXPIRY_DATE, PACK_SIZE, PRICE_PER_PACK, AVAILABLE_STOCK, AVG_MONTHLY_CONSUMPTION, PHARMACY_ID) VALUES (" + data.medicine_id + ",'" + data.batch_number + "', '" + data.expiry_date + "', " + data.pack_size + "," + data.price + "," + data.quantity + ", '" + data.avg_monthly_consumption + "', " + data.user_id + ");";
	return this.dbQuerySync(query);
};

stock_list_model.prototype.select_stock_record_by_id = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_STOCK_LIST WHERE ID = " + data.stock_id;
	return this.dbQuerySync(query);
};

stock_list_model.prototype.select_stock_record_by_pharmacy = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_STOCK_LIST WHERE ID =" + data.stock_id + " AND PHARMACY_ID =" + data.user_id;
	return this.dbQuerySync(query);
};

stock_list_model.prototype.update_stock_record = function(data) {
	var query = "UPDATE DASH5082.CHEMO_STOCK_LIST SET BATCH_NUMBER = '" + data.batch_number + "', EXPIRY_DATE = '" + data.expiry_date + "', PACK_SIZE = " + data.pack_size + ", PRICE_PER_PACK = " + data.price + ", AVAILABLE_STOCK = " + data.quantity + ", AVG_MONTHLY_CONSUMPTION = '" + data.avg_monthly_consumption + "', UPDATED_AT = CURRENT_TIMESTAMP WHERE ID =" + data.stock_id + " AND PHARMACY_ID =" + data.user_id;
	console.log(query);
	return this.dbQuerySync(query);
};

stock_list_model.prototype.delete_stock_record = function(data) {
	var query = "DELETE FROM DASH5082.CHEMO_STOCK_LIST WHERE ID =" + data.stock_id + " AND PHARMACY_ID =" + data.user_id;
	return this.dbQuerySync(query);
};

stock_list_model.prototype.select_stocks_by_medicine_id = function(data) {
	var query = "SELECT * FROM DASH5082.CHEMO_STOCK_LIST WHERE MEDICINE_ID = " + data.medicine_id;
	return this.dbQuerySync(query);
};

module.exports = new stock_list_model();
