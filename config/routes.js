module.exports = function(app){

	//Controllers++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	var home_controller = require('../controllers/user/home');
	var user_authentication_controller = require('../controllers/user/authentication');
	var user_forgot_password_controller = require('../controllers/user/forgot_password');
	var user_reset_password_controller = require('../controllers/user/reset_password');
	

	var admin_authentication_controller = require('../controllers/admin/authentication');
	var admin_forgot_password_controller = require('../controllers/admin/forgot_password');
	var admin_reset_password_controller = require('../controllers/admin/reset_password');
	var admin_manage_users_controller = require('../controllers/admin/manage_users');
	var admin_manage_medicines_controller = require('../controllers/admin/manage_medicines');
	var admin_manage_admins_controller = require('../controllers/admin/manage_admins');

	var pharmacy_first_login_controller = require('../controllers/pharmacy/first_login');
	var pharmacy_profile_controller = require('../controllers/pharmacy/profile');
	var pharmacy_stock_controller = require('../controllers/pharmacy/stock');
	
	var doctor_first_login_controller = require('../controllers/doctor/first_login');
	var doctor_profile_controller = require('../controllers/doctor/profile');
	var doctor_treatment_center_controller = require('../controllers/doctor/treatment_center');
	var doctor_select_medicine_controller = require('../controllers/doctor/select_medicine');
	var doctor_select_pharmacy_controller = require('../controllers/doctor/select_pharmacy');
	var doctor_shopping_list_controller = require('../controllers/doctor/shopping_list');
	
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	//Middlewares++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	var admin_middleware = require('../middlewares/admin');
	var doctor_middleware = require('../middlewares/doctor');
	var pharmacy_middleware = require('../middlewares/pharmacy');	
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	//Routes+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	app.get('/', home_controller.home_page);
	app.get('/terms_and_conditions', home_controller.terms_and_conditions_page);
	app.post('/getmedicinebygenericandform', home_controller.get_medicines_by_generic_and_form)
	app.post('/getavailablepharmaciesbyid', home_controller.get_pharmacies);
	app.get('/getapprovedmedicines', home_controller.get_medicines);
	app.post('/user/login', user_authentication_controller.login);
	app.post('/user/signup', user_authentication_controller.signup);
	app.get('/logout', user_authentication_controller.logout);
	app.get('/user/forgotpassword', user_forgot_password_controller.forgot_password_page);
	app.post('/user/forgotpassword', user_forgot_password_controller.forgot_password_process);
	app.get('/user/resetpassword/:token', user_reset_password_controller.reset_password_page);
	app.post('/user/resetpassword', user_reset_password_controller.reset_password_process);
	
	app.get('/admin/login', admin_authentication_controller.login_page);
	app.post('/admin/login', admin_authentication_controller.login);
	app.get('/admin/logout', admin_authentication_controller.logout);
	app.get('/admin/forgotpassword', admin_forgot_password_controller.forgot_password_page);
	app.post('/admin/forgotpassword', admin_forgot_password_controller.forgot_password_process);
	app.get('/admin/resetpassword/:token', admin_reset_password_controller.reset_password_page);
	app.post('/admin/resetpassword', admin_reset_password_controller.reset_password_process);
	app.get('/admin/manage_users', admin_middleware.check_admin_sign_in, admin_manage_users_controller.manage_users_page);
	app.post('/admin/get_user_history', admin_middleware.check_admin_sign_in, admin_manage_users_controller.get_user_history);
	app.post('/admin/addnewuser', admin_middleware.check_admin_sign_in, admin_manage_users_controller.add_new_user);
	app.post('/admin/addnewadmin', admin_middleware.check_admin_sign_in, admin_manage_users_controller.add_new_admin);
	app.post('/admin/approveuser', admin_middleware.check_admin_sign_in, admin_manage_users_controller.approve_user);
	app.post('/admin/suspenduser', admin_middleware.check_admin_sign_in, admin_manage_users_controller.suspend_user);
	app.post('/admin/activateuser', admin_middleware.check_admin_sign_in, admin_manage_users_controller.activate_user);
	app.post('/admin/deleteuser', admin_middleware.check_admin_sign_in, admin_manage_users_controller.delete_user);
	app.get('/admin/manage_medicines', admin_middleware.check_admin_sign_in, admin_manage_medicines_controller.manage_medicines_page);
	app.post('/admin/addnewmedicine', admin_middleware.check_admin_sign_in, admin_manage_medicines_controller.add_new_medicine);
	app.post('/admin/updatemedicine', admin_middleware.check_admin_sign_in, admin_manage_medicines_controller.update_medicine);
	app.post('/admin/deleteapprovedmedicine', admin_middleware.check_admin_sign_in, admin_manage_medicines_controller.delete_approved_medicine);
	app.post('/admin/deletenonapprovedmedicine', admin_middleware.check_admin_sign_in, admin_manage_medicines_controller.delete_non_approved_medicine);
	app.get('/admin/getmedicinebyid/:id', admin_middleware.check_admin_sign_in, admin_manage_medicines_controller.get_medicine_by_id);
	app.get('/admin/downloadtemplate', admin_middleware.check_admin_sign_in, admin_manage_medicines_controller.download_medicines_template);
	app.post('/admin/uploadmedicines', admin_middleware.check_admin_sign_in, admin_manage_medicines_controller.upload_medicines_list);
	app.post('/admin/uploadstocklist', admin_middleware.check_admin_sign_in, admin_manage_medicines_controller.upload_stock_list);
	app.get('/admin/admins_list', admin_middleware.check_admin_sign_in, admin_manage_admins_controller.admins_list_page);
	app.post('/admin/changetype', admin_middleware.check_admin_sign_in, admin_manage_admins_controller.change_type);
	app.post('/admin/activateadmin', admin_middleware.check_admin_sign_in, admin_manage_admins_controller.activate_admin);

	app.get('/pharmacy/profile', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_profile_controller.profile_page);
	app.post('/pharmacy/updateprofile', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_profile_controller.update_profile);
	app.post('/pharmacy/changepassword', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_profile_controller.change_password);
	app.get('/pharmacy', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_stock_controller.stock_page);
	app.post('/pharmacy/getstockrecord', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_stock_controller.get_stock_record);
	app.post('/pharmacy/addnewmedicine', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_stock_controller.add_new_medicine);
	app.post('/pharmacy/addnewapprovedmedicine', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_stock_controller.add_new_approved_medicine);
	app.post('/pharmacy/updatemedicine', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_stock_controller.update_medicine);
	app.post('/pharmacy/deletemedicine', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_stock_controller.delete_medicine);
	app.post('/pharmacy/uploadstocklist', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_stock_controller.upload_stock_list);
	app.get('/pharmacy/downloadtemplate', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_stock_controller.download_stock_list_template);
	app.get('/pharmacy/downloadlaststock', pharmacy_middleware.pharmacy_check_sign_in, pharmacy_stock_controller.download_last_stock);
	app.get('/pharmacy/first_changepassword', pharmacy_middleware.pharmacy_check_first_login, pharmacy_first_login_controller.first_login_page);
	app.post('/pharmacy/first_changepassword', pharmacy_middleware.pharmacy_check_first_login, pharmacy_first_login_controller.change_password);

	app.get('/doctor/profile', doctor_middleware.doctor_check_sign_in, doctor_profile_controller.profile_page);
	app.post('/doctor/changepassword', doctor_middleware.doctor_check_sign_in, doctor_profile_controller.change_password);
	app.post('/doctor/updateprofile', doctor_middleware.doctor_check_sign_in, doctor_profile_controller.update_profile);
	app.get('/doctor', doctor_middleware.doctor_check_sign_in, doctor_treatment_center_controller.treatment_center_page);
	app.post('/doctor/gettreatmentcenter', doctor_middleware.doctor_check_sign_in, doctor_treatment_center_controller.get_treatment_center_details);
	app.get('/doctor/selectmedicine', doctor_middleware.doctor_check_sign_in, doctor_select_medicine_controller.select_medicine_page);
	app.post('/doctor/selectmedicinedetails', doctor_middleware.doctor_check_sign_in, doctor_select_medicine_controller.select_medicine_details);
	app.get('/doctor/selectpharmacy', doctor_middleware.doctor_check_sign_in, doctor_select_pharmacy_controller.select_pharmacy_page);
	app.get('/doctor/shoppinglist', doctor_middleware.doctor_check_sign_in, doctor_shopping_list_controller.shopping_list_page);
	app.post('/doctor/shoppinglist/sendemail', doctor_middleware.doctor_check_sign_in, doctor_shopping_list_controller.send_email);
	app.post('/doctor/savemedicinesession', doctor_middleware.doctor_check_sign_in, doctor_shopping_list_controller.save_medicine_session);
	app.get('/doctor/first_changepassword', doctor_middleware.doctor_check_first_login, doctor_first_login_controller.first_login_page);
	app.post('/doctor/first_changepassword', doctor_middleware.doctor_check_first_login, doctor_first_login_controller.change_password);

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
}