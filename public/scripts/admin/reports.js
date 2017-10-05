var url = window.location.origin;
var data = {};
$(document).click(function() {
    $('.error-form').remove();
});

function downloadShoppingList(){
			alert("down laod shopping list");
			$.ajax({
					type: "post",
					url: url +'/admin/reports/async_download_shopping_list',
					data : data,
					success:  function(data){
						$('#loadingModal').modal('hide');
						$('#sendEmail').modal('show');
						console.log(data);
						console.log(data.message);
						$('.error-form').remove();
						$('.message-form').remove();
						if(data.message == "failed")
						{

						if(data.email_error)
						{
								var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>' + data.email_error + '</div>';
						}
						else {
							var error_message = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button> Failed to send email</div>';
						}
						$(error_message).insertBefore($('#email-box'));
						}
						else
						{
							$('#sendEmail').modal('hide');
							email.val('');
							$('#confirmEmail').modal('show');
						}
					}
			});
		}
