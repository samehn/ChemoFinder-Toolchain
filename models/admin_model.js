model 					= require('./model');
var admin_model 			= function(){ };
admin_model.prototype.constructor  	= admin_model;
admin_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

admin_model.prototype.select_admin_by_key = function(data) {
	var query = "SELECT * from DASH5082.ADMIN WHERE USERNAME ='" + this.mysql_real_escape_string(data.key) + "' OR EMAIL ='" + this.mysql_real_escape_string(data.key) + "';";
	return this.dbQuerySync(query);
};

admin_model.prototype.select_admin_by_username = function(data) {
	var query = "SELECT * from DASH5082.ADMIN WHERE USERNAME ='" + this.mysql_real_escape_string(data.username) + "';";
	return this.dbQuerySync(query);
};

admin_model.prototype.select_admin_by_email = function(data) {
	var query = "SELECT * from DASH5082.ADMIN WHERE EMAIL ='" + this.mysql_real_escape_string(data.email) + "';";
	return this.dbQuerySync(query);
};

admin_model.prototype.select_admin_by_id = function(data) {
	var query = "SELECT * from DASH5082.ADMIN WHERE ID =" + this.mysql_real_escape_string(data.admin_id) + ";";
	return this.dbQuerySync(query);
};

admin_model.prototype.update_admin_password = function(data) {
	var query = "UPDATE DASH5082.ADMIN SET PASSWORD ='" + this.mysql_real_escape_string(data.password) + "' WHERE ID =" + this.mysql_real_escape_string(data.admin_id) + ";";
	return this.dbQuerySync(query);
};

admin_model.prototype.insert_admin = function(data) {
	var query = "INSERT INTO DASH5082.ADMIN (EMAIL, PASSWORD, USERNAME, TYPE) VALUES ('" + this.mysql_real_escape_string(data.email) + "','" + this.mysql_real_escape_string(data.password) + "','" + this.mysql_real_escape_string(data.username) + "', " + this.mysql_real_escape_string(data.type) + ");";
	return this.dbQuerySync(query);
};

admin_model.prototype.select_admins = function() {
	var query = "SELECT * from DASH5082.ADMIN";
	return this.dbQuerySync(query);
};

admin_model.prototype.change_admin_type = function(data) {
	var query = "UPDATE DASH5082.ADMIN SET TYPE='" + this.mysql_real_escape_string(data.type) + "' WHERE ID=" + this.mysql_real_escape_string(data.admin_id) + ";";
	return this.dbQuerySync(query);
};

admin_model.prototype.update_admin_active = function(data) {
	var query = "UPDATE DASH5082.ADMIN SET ACTIVE='" + this.mysql_real_escape_string(data.active) + "' WHERE ID=" + this.mysql_real_escape_string(data.admin_id) + ";";
	return this.dbQuerySync(query);
};

//+++++++++++++++++++++++ASYNC+++++++++++++++++++++++++++++++++++

admin_model.prototype.async_select_admin_by_key = function(data, callback) {
	var query = "SELECT * from DASH5082.ADMIN WHERE USERNAME ='" + this.mysql_real_escape_string(data.key) + "' OR EMAIL ='" + this.mysql_real_escape_string(data.key) + "';";
	return this.dbQuery(query, callback);
};

admin_model.prototype.async_select_admin_by_username = function(data, callback) {
	var query = "SELECT * from DASH5082.ADMIN WHERE USERNAME ='" + this.mysql_real_escape_string(data.username) + "';";
	return this.dbQuery(query, callback);
};

admin_model.prototype.async_select_admin_by_email = function(data, callback) {
	var query = "SELECT * from DASH5082.ADMIN WHERE EMAIL ='" + this.mysql_real_escape_string(data.email) + "';";
	return this.dbQuery(query, callback);
};

admin_model.prototype.async_select_admin_by_id = function(data, callback) {
	var query = "SELECT * from DASH5082.ADMIN WHERE ID =" + this.mysql_real_escape_string(data.admin_id) + ";";
	return this.dbQuery(query, callback);
};

admin_model.prototype.async_update_admin_password = function(data, callback) {
	var query = "UPDATE DASH5082.ADMIN SET PASSWORD ='" + this.mysql_real_escape_string(data.password) + "' WHERE ID =" + this.mysql_real_escape_string(data.admin_id) + ";";
	return this.dbQuery(query, callback);
};

admin_model.prototype.async_insert_admin = function(data, callback) {
	var query = "INSERT INTO DASH5082.ADMIN (EMAIL, PASSWORD, USERNAME, TYPE) VALUES ('" + this.mysql_real_escape_string(data.email) + "','" + this.mysql_real_escape_string(data.password) + "','" + this.mysql_real_escape_string(data.username) + "', " + this.mysql_real_escape_string(data.type) + ");";
	return this.dbQuery(query, callback);
};

admin_model.prototype.async_select_admins = function(callback) {
	var query = "SELECT * from DASH5082.ADMIN";
	return this.dbQuery(query, callback);
};

admin_model.prototype.async_change_admin_type = function(data, callback) {
	var query = "UPDATE DASH5082.ADMIN SET TYPE='" + this.mysql_real_escape_string(data.type) + "' WHERE ID=" + this.mysql_real_escape_string(data.admin_id) + ";";
	return this.dbQuery(query, callback);
};

admin_model.prototype.async_update_admin_active = function(data, callback) {
	var query = "UPDATE DASH5082.ADMIN SET ACTIVE='" + this.mysql_real_escape_string(data.active) + "' WHERE ID=" + this.mysql_real_escape_string(data.admin_id) + ";";
	return this.dbQuery(query, callback);
};

module.exports = new admin_model();