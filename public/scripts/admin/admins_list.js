var url = window.location.origin;
$(function() {
    $('#adminsTable').DataTable({
      "scrollX": true
    });
});

$(document).click(function() {
    $('.error-form').remove();
});

$("#change-type-btn").click(function(e) {
    e.stopPropagation();
    return false;
})

function changeType(admin_id) {
	$('#change-type-btn').attr('onclick','changeAdminType(' + admin_id + ')'); 
}

function activate(id) {
	if (confirm("Are you sure you want to activate this user ?") == true) {
        var data_array={};
		data_array['id'] = id;
		data_array['active'] = 1;
		$.ajax({
	        type: "post",
	        url: url + '/admin/activateadmin',
	        data : data_array,
	        success:  function(data){
	        	if(data.message == 'success') {
	        		console.log(data);
	        		window.location = url + '/admin/admins_list';	
	        	}
	        }
		}); 
  	}
}

function suspend(id) {
	if (confirm("Are you sure you want to suspend this user ?") == true) {
        var data_array={};
		data_array['id'] = id;
		data_array['active'] = 0;
		$.ajax({
	        type: "post",
	        url: url + '/admin/activateadmin',
	        data : data_array,
	        success:  function(data){
	        	if(data.message == 'success') {
	        		console.log(data);
	        		window.location = url + '/admin/admins_list';	
	        	}
	        }
		}); 
  	}
}

function changeAdminType(id) {
	if (confirm("Are you sure you want to change this admin type ?") == true) {
        var data_array={};
		data_array['id'] = id;
		data_array['type'] = $('#typeAdmin').val();
		$.ajax({
	        type: "post",
	        url: url + '/admin/changetype',
	        data : data_array,
	        success:  function(data){
	        	if(data.message == 'success') {
	        		console.log(data);
	        		window.location = url + '/admin/admins_list';	
	        	}
	        }
		}); 
  	}
}
