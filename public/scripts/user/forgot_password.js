var url = window.location.origin;
function reset_password() {
	
	var user_array={};
    var email = $('#uEmail');
    user_array[email.attr('name')] = email.val();
    console.log(user_array);
    $.ajax({
    	type: "post",
    	url: url + '/user/forgotpassword',
    	data : user_array,
    	success:  function(data){
    		console.log(data);
    		console.log(data.message);
    		$('.error-form').remove();
            $('.message-form').remove();
            if(data.message == "failed")
            {
               if(data.fpassword_error)
               {
                  var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.fpassword_error + '</div>';
                  $(error_message).insertBefore($('#emailForm'));
               }
            }
    		else if(data.message == "success")
    		{
    			 var message = '<div class="alert alert-success message-form"><button class="close" data-close="alert"></button> Check your email to reset your password</div>';
                $(message).insertBefore($('#emailForm'));
    		}
    	}
    });

}