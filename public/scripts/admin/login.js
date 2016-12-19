var url = window.location.origin;

$('#login-form').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    login();
    return false;
  }
});
$(document).click(function() {
    $('.error-form').remove();
});

$("#login-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

function login() {
	console.log('test');
	var user_array={};
    var email = $('#uEmail');
    var password = $('#uPassword');
    user_array[email.attr('name')] = email.val();
    user_array[password.attr('name')] = password.val();
    $('#loadingModal').modal('show');
    $.ajax({
    	type: "post",
    	url: url + "/admin/login",
    	data : user_array,
    	success:  function(data){

    		console.log(data);
    		console.log(data.message);
    		$('.error-form').remove();
            $('.message-form').remove();
            if(data.message == "failed")
            {
               $('#loadingModal').modal('hide'); 
               if(data.login_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.login_error + '</div>';
                  $(error_message).insertBefore($('#emailLoginForm'));
               }
            }
    		else if(data.message == "success")
    		{
    			window.location = url + '/admin/manage_users';
    		}
    	}
    });

}