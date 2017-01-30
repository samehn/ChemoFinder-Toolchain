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
		$('#available-medicines').html('<tr class="tr_search"><td style="text-align: center;" valign="top" colspan="8" class="empty_table td_search">No treatment center has been chosen yet</td></tr>');
	}
	else {
		$.ajax({
	      type: "post",
	      url: url +'/doctor/gettreatmentcentermedicines?' + urlParamaeters,
	      data : data,
	      success:  function(result){
	      	console.log(result);
	      	if(result.message == "success") {
	      		var html = '<tr class="tr_search_row"><td class="td_search">' + result.treatmentCenter[0].NAME + '</td><td class="td_search">' + result.treatmentCenter[0].PHONE_NUMBER + '</td><td class="td_search">' + result.treatmentCenter[0].EMAIL + '</td><td class="td_search">' + result.treatmentCenter[0].STREET + '</td><td class="td_search">' + result.treatmentCenter[0].CITY + '</td><td class="td_search">' + result.treatmentCenter[0].STATE + '</td><td class="td_search">' + result.treatmentCenter[0].ZIP + '</td><td class="td_search">' + result.treatmentCenter[0].OPEN_FROM + '</td><td class="td_search">' + result.treatmentCenter[0].OPEN_TO + '</td></tr>';
	      		$('#treatment-center-details').html(html);
	      		var html = '';
	      		if(result.medicines.length > 0) {
	      			for (var i = 0; i < result.medicines.length; i++) {
	      				html = html + '<tr class="tr_search_row"><td class="td_search">' + result.medicines[i].quantity + '</td><td class="td_search">' + result.medicines[i]['medicine'].GENERIC_NAME + '</td><td class="td_search">' + result.medicines[i]['medicine'].BRAND_NAME + '</td><td class="td_search">' + result.medicines[i]['medicine'].FORM + '</td><td class="td_search">' + result.medicines[i]['medicine'].STRENGTH + '</td><td class="td_search">' + result.medicines[i]['medicine'].STRENGTH_UNIT + '</td><td class="td_search">' + result.medicines[i]['medicine'].MANUFACTURER + '</td><td class="td_search">' + result.medicines[i]['medicine'].LAST_UPDATE + '</td></tr>';
	      			}
	      		}
	      		else {
	      			html = '<tr class="tr_search"><td style="text-align: center;" valign="top" colspan="8" class="empty_table td_search">There are no medicines available currently</td></tr>';
	      		}

	      		$('#available-medicines').html(html);
	      	}
	      	else {
	 			$('#treatment-center-details').html('<tr class="tr_search"><td style="text-align: center;" valign="top" colspan="9" class="empty_table td_search">No treatment center has been chosen yet</td></tr>');
				$('#available-medicines').html('<tr class="tr_search"><td style="text-align: center;" valign="top" colspan="8" class="empty_table td_search">No treatment center has been chosen yet</td></tr>');     		
	      	}
	      }
	  	});
	}
}

function nextStep() {
	var treatmentCenter = $('#treatment-center-select').val();
	if(treatmentCenter == 0) {
		html = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>No treatment center has been chosen</div>';
		alert('No treatment center has been chosen');
		$(html).insertBefore('#treatment-center-select');
	}
	else {
		window.location.href = url + '/doctor/selectpharmacies?' + window.location.search.substring(1) + '&t='+ treatmentCenter;
	}
}
