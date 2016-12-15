var url = window.location.origin;

$('.forgot-password-body').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    reset_password();
    return false;
  }
});

$(document).click(function() {
    $('.error-form').remove();
});

$("#forgot-password-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

function reset_password() {
	var user_array={};
    var email = $('#uEmail');
    user_array[email.attr('name')] = email.val();
    console.log(user_array);
    $('#loadingModal').modal('show');
    $.ajax({
    	type: "post",
    	url: url + '/user/forgotpassword',
    	data : user_array,
    	success:  function(data){
            $('#loadingModal').modal('hide');
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
    			$('#confimForgotPassword').modal('show');
    		}
    	}
    });

}