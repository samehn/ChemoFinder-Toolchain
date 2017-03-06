model 					= require('./model');
var admin_model 			= function(){ };
admin_model.prototype.constructor  	= admin_model;
admin_model.prototype     		= model;
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

admin_model.prototype.select_admin_by_key = function(data) {
	var query = "SELECT * from DASH5082.ADMIN WHERE USERNAME ='" + data.key + "' OR EMAIL ='" + data.key + "';";
	return this.dbQuerySync(query);
};

admin_model.prototype.select_admin_by_username = function(data) {
	var query = "SELECT * from DASH5082.ADMIN WHERE USERNAME ='" + data.username + "';";
	return this.dbQuerySync(query);
};

admin_model.prototype.select_admin_by_email = function(data) {
	var query = "SELECT * from DASH5082.ADMIN WHERE EMAIL ='" + data.email + "';";
	return this.dbQuerySync(query);
};

admin_model.prototype.update_admin_password = function(data) {
	var query = "UPDATE DASH5082.ADMIN SET PASSWORD ='" + data.password + "' WHERE ID =" + data.admin_id + ";";
	return this.dbQuerySync(query);
};

admin_model.prototype.insert_admin = function(data) {
	var query = "INSERT INTO DASH5082.ADMIN (EMAIL, PASSWORD, USERNAME, TYPE) VALUES ('" + data.email + "','" + data.password + "','" + data.username + "', " + data.type + ");";
	return this.dbQuerySync(query);
};

admin_model.prototype.select_admins = function() {
	var query = "SELECT * from DASH5082.ADMIN";
	return this.dbQuerySync(query);
};

admin_model.prototype.change_admin_type = function(data) {
	var query = "UPDATE DASH5082.ADMIN SET TYPE='" + data.type + "' WHERE ID=" + data.admin_id + ";";
	return this.dbQuerySync(query);
};

admin_model.prototype.update_admin_active = function(data) {
	var query = "UPDATE DASH5082.ADMIN SET ACTIVE='" + data.active + "' WHERE ID=" + data.admin_id + ";";
	return this.dbQuerySync(query);
};

module.exports = new admin_model();