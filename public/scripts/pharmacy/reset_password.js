var url = window.location.origin;
function reset_password() {
	var pathname = window.location.pathname;
    var urlArray = pathname.split('/');
    var token = urlArray[urlArray.length -1];
	var user_array={};
    var password = $('#password');
    var rpassword =$('#rpassword');
    user_array[password.attr('name')] = password.val();
    user_array[rpassword.attr('name')] = rpassword.val();
    user_array['token'] = token;
    $.ajax({
    	type: "post",
    	url: url + '/pharmacy/resetpassword',
    	data : user_array,
    	success:  function(data){
    		console.log(data);
    		console.log(data.message);
    		$('.error-form').remove();
            $('.message-form').remove();
            if(data.message == "failed")
            {
               if(data.password_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.password_error + '</div>';
                  $(error_message).insertBefore($('#passwordForm'));
               }
               if(data.rpassword_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.rpassword_error + '</div>';
                  $(error_message).insertBefore($('#rpasswordForm'));
               }
            }
    		else if(data.message == "success")
    		{
    			 var message = '<div class="alert alert-success message-form"><button class="close" data-close="alert"></button> Your password has been reset successfully! </div>';
                $(message).insertBefore($('#passwordForm'));
    		}
    	}
    });

}