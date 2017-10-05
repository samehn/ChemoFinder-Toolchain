model 					= require('./model');
var shopping_list_model 			= function(){ };
shopping_list_model.prototype.constructor  	= shopping_list_model;
shopping_list_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

shopping_list_model.prototype.insert_new_shopping_list_operation = function(data) {
	var query = "INSERT INTO DASH5082.SHOPPING_OPERATION  " +
  "(OPERATION_ID, MEDICINE_ID, TREATMENT_CENTR_ID, DOCTOR_ID, PATIENT_ID, MEDICINE_QUANTITY, MEDICINE_GENERIC_NAME, MEDICINE_BRAND_NAME, MEDICINE_FORM , " +
  "MEDICINE_STRENGTH, MEDICINE_STRENGTH_UNIT, MEDICINE_MANUFACTURER) VALUES ('" +
  this.mysql_real_escape_string(data.OPERATION_ID) + "','" + this.mysql_real_escape_string(data.MEDICINE_ID) + "','" +
  this.mysql_real_escape_string(data.TREATMENT_CENTR_ID) + "','" + this.mysql_real_escape_string(data.DOCTOR_ID) + "','" +
  this.mysql_real_escape_string(data.PATIENT_ID) + "','" +this.mysql_real_escape_string(data.MEDICINE_QUANTITY) + "','" +
  this.mysql_real_escape_string(data.MEDICINE_GENERIC_NAME) + "','" +
  this.mysql_real_escape_string(data.MEDICINE_BRAND_NAME) + "','" + this.mysql_real_escape_string(data.MEDICINE_FORM) + "','" +
  this.mysql_real_escape_string(data.MEDICINE_STRENGTH) + "', '" + this.mysql_real_escape_string(data.MEDICINE_STRENGTH_UNIT) + "', '" +
  this.mysql_real_escape_string(data.MEDICINE_MANUFACTURER) + "');";
	console.log(query);

	return this.dbQuerySync(query);

};

shopping_list_model.prototype.insert_new_shopping_list_pharmacy = function(data) {

  var query = "INSERT INTO DASH5082.SHOPPING_OPERATION_PHARMECY  " +
  "(OPERATION_ID,MEDICINE_ID,PHARMACY_ID, ENTITY_NAME, PHONE_NUMBER, EMAIL, ADDRESS, CITY, COUNTRY, OPEN_FROM, OPEN_TO , " +
  "EXPIRY_DATE, PACK_SIZE, PRICE_PER_PACK) VALUES ('" +
  this.mysql_real_escape_string(data.OPERATION_ID) +"','" + this.mysql_real_escape_string(data.MEDICINE_ID) + "','"+ this.mysql_real_escape_string(data.PHARMACY_ID) + "','" + this.mysql_real_escape_string(data.ENTITY_NAME) + "','" +
  this.mysql_real_escape_string(data.PHONE_NUMBER) + "','" + this.mysql_real_escape_string(data.EMAIL) + "','" +
  this.mysql_real_escape_string(data.ADDRESS) + "','" +this.mysql_real_escape_string(data.CITY) + "','" +
  this.mysql_real_escape_string(data.COUNTRY) + "','" +
  this.mysql_real_escape_string(data.OPEN_FROM) + "','" + this.mysql_real_escape_string(data.OPEN_TO) + "','" +
  this.mysql_real_escape_string(data.EXPIRY_DATE) + "', '" + this.mysql_real_escape_string(data.PACK_SIZE) + "', '" +
  this.mysql_real_escape_string(data.PRICE_PER_PACK) + "');";
	console.log(query);
  return this.dbQuerySync(query);

}

//+++++++++++++++++++ download-shopping-list+++++++++++

shopping_list_model.prototype.async_download_shopping_list = function(callback) {
	var query = "SELECT * FROM DASH5082.SHOPPING_OPERATION SL JOIN DASH5082.SHOPPING_OPERATION_PHARMECY OP ON SL.OPERATION_ID = OP.OPERATION_ID"  ;
	return this.dbQuery(query, callback);
};
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = new shopping_list_model();
