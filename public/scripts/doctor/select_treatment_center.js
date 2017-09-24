var url = window.location.origin;
$(document).click(function() {
    $('.error-form').remove();
});

$("#next-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

function selectTreatmentCenter(element) {
	var id = $(element).val();
	var data = {id: id};
	var urlParamaeters =  window.location.search.substring(1);
	console.log(urlParamaeters);
	if(id == 0) {
		$('#treatment-center-details').html('<tr class="tr_search"><td style="text-align: center;" valign="top" colspan="9" class="empty_table td_search">No treatment center has been chosen yet</td></tr>');
	}
	else {
		$.ajax({
	      type: "post",
	      url: url +'/doctor/gettreatmentcenter',
	      data : data,
	      success:  function(result){
	      	$('.error-form').remove();
      		$('.message-form').remove();
	      	console.log(result);
	      	if(result.message == "success") {
	      		var html = '<tr class="tr_search_row"><td class="td_search">' + result.treatmentCenter[0].ENTITY_NAME + '</td><td class="td_search">' + result.treatmentCenter[0].PHONE_NUMBER + '</td><td class="td_search">' + result.treatmentCenter[0].EMAIL + '</td><td class="td_search">' + result.treatmentCenter[0].ADDRESS + '</td><td class="td_search">' + result.treatmentCenter[0].CITY + '</td><td class="td_search">' + result.treatmentCenter[0].COUNTRY + '</td><td class="td_search">' + result.treatmentCenter[0].OPEN_FROM + '</td><td class="td_search">' + result.treatmentCenter[0].OPEN_TO + '</td><td class="td_search">' + result.treatmentCenter[0].STOCK_UPDATE + '</td></tr>';
	      		$('#treatment-center-details').html(html);
	      	}
	      	else {
	 			$('#treatment-center-details').html('<tr class="tr_search"><td style="text-align: center;" valign="top" colspan="9" class="empty_table td_search">No treatment center has been chosen yet</td></tr>');
	      	}
	      }
	  	});
	}
}

function nextStep() {
  $('.error-form').remove();
  $('.message-form').remove();
	var treatmentCenter = $('#treatment-center-select').val();
  var patientId = $('#patient-id').val();
	if(treatmentCenter == 0) {
		html = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>No treatment center has been chosen</div>';
		alert('No treatment center has been chosen');
		$(html).insertBefore('#treatment-center-select');
	}
  else if (patientId == ""){
    html = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>Patient ID could not be empty</div>';
		alert('Please provide patient ID');
		$(html).insertBefore('#patient-id');
  }
	else {
		window.location.href = url + '/doctor/selectmedicine?t='+ treatmentCenter + '&pid=' + patientId;
	}
}
