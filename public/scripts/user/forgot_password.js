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

function go_home(user_type) {
    if(user_type == 'user')
    {
        url2 = '/';
    }
    else
    {
        url2 = '/admin/login';
    }
    window.location.href = url + url2;
}

function reset_password(user_type) {
	var user_array={};
    var email = $('#uEmail');
    user_array[email.attr('name')] = email.val();
    console.log(user_array);
    $('#loadingModal').modal('show');
    var url2;
    if(user_type == 'user')
    {
        url2 = '/user/forgotpassword';
    }
    else
    {
        url2 = '/admin/forgotpassword';
    }
    $.ajax({
    	type: "post",
    	url: url + url2,
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