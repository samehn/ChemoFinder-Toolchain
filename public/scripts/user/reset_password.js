var url = window.location.origin;
$('.reset-password-body').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
    reset_password();
    return false;
  }
});

$(document).click(function() {
    $('.error-form').remove();
});

$("#reset-password-btn").click(function(e) {
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
	var pathname = window.location.pathname;
  var urlArray = pathname.split('/');
  var token = urlArray[urlArray.length -1];
	var user_array={};
  var password = $('#password');
  var rpassword =$('#rpassword');
  user_array[password.attr('name')] = password.val();
  user_array[rpassword.attr('name')] = rpassword.val();
  user_array['token'] = token;
  console.log(user_array);
  var url2;
  if(user_type == 'user')
  {
    url2 = '/user/resetpassword';
  }
  else
  {
    url2 = '/admin/resetpassword';
  } 
  $('#loadingModal').modal('show');
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
        $('#confimResetPassword').modal('show');
  		}
  	}
  });
}