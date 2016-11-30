var url = window.location.origin;
$(document).ready(function(){
   $('#newAccountsTable').DataTable();
   $('#usersTable').DataTable();
});

function approve(id,type) {
	var data_array={};
	data_array['id'] = id;
	var url2 = '';
	if(type == 'DOCTOR')
	{
		url2 = '/admin/approvedoctor';
	}
	if(type == 'PHARMACY')
	{
		url2 = '/admin/approvepharmacy';
	}
	$.ajax({
        type: "post",
        url: url + url2,
        data : data_array,
        success:  function(data){
        	window.location = url + '/admin/manage_users';
        }
	});
}

function suspend(id) {
	// body...
}

function activate(id) {
	// body...
}