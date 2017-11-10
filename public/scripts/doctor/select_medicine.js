var url = window.location.origin;
$(document).click(function() {
    $('.error-form').remove();
});
$("#next-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

for (var i = 1; i <= 20; i++) {
    $('.qty-20').append('<option value="'+i+'">'+i+'</option>')
}

function selectMedicine(element) {
	var medicine = $(element).val();
	var generic_name = $('option:selected', element).attr("data-name");
	var form = $('option:selected', element).attr("data-form");
  var medicine_id = $('option:selected', element).attr("data-medicine_id");

	if(generic_name && form) {
		var data = {generic_name: generic_name, form: form, medicine_id: medicine_id};
		console.log(data);
		$.ajax({
	      type: "post",
	      url: url +'/doctor/selectmedicinedetails',
	      data : data,
	      success:  function(result){
	      	$('.error-form').remove();
      		$('.message-form').remove();
	      	console.log(result);
	      	$('#medicinesDetails').html('<tr class="tr_search"><td style="text-align: center;" valign="top" colspan="9" class="empty_table td_search">No medicines are chosen yet</td></tr>');
	      	if(result.message == 'success') {
	      		if(result.medicines.length > 0) {
	      			var html = '';
	      			for (var i = 0; i < result.medicines.length; i++) {
	      				html = html + '<tr class="tr_search">' +
	      									'<td class="td_search">' +
                            					'<input type="radio" name="selected_medicine" data-price=' + result.medicines[i].PRICE_PER_PACK + ' value=' + result.medicines[i].ID + ' onclick="updateSelectedMedicine(this)">' +
                            				'</td>'	+
                            				'<td class="td_search">' + result.medicines[i].GENERIC_NAME + '</td>' +
                            				//'<td class="td_search">' + result.medicines[i].BRAND_NAME + '</td>' +
                            				'<td class="td_search">' + result.medicines[i].FORM + '</td>' +
                            				'<td class="td_search">' + result.medicines[i].STRENGTH + '</td>' +
                            				'<td class="td_search">' + result.medicines[i].STRENGTH_UNIT + '</td>' +
                            				//'<td class="td_search">' + result.medicines[i].PACK_TYPE + '</td>' +
                            				//'<td class="td_search">' + result.medicines[i].MANUFACTURER + '</td>' +
                            				'<td class="td_search">' + result.medicines[i].PRICE_PER_PACK + '</td>' +
                            			'</tr>';
	      			}
	      			$('#medicinesDetails').html(html);
	      			$('.tr_search:odd').css("background-color", "#ffffff" );
					$('.tr_search:even').css("background-color", "#f2f2f2" );
	      		}
	      		else {
		      		html = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>This medicine is not available currently in any pharmacy</div>';
					$(html).insertBefore('#medicine_details_table');
		      	}
	      	}
	      	else {
	      		html = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>This medicine is not available currently in any pharmacy.</div>';
				$(html).insertBefore('#medicine_details_table');
	      	}
	      }
	  	});
	}
	else {
		$('#medicinesDetails').html('<tr class="tr_search"><td style="text-align: center;" valign="top" colspan="9" class="empty_table td_search">No medicines are chosen yet</td></tr>');
	}
}

function updateSelectedMedicine(element) {
	$('.tr_search:odd').css("background-color", "#ffffff" );
	$('.tr_search:even').css("background-color", "#f2f2f2" );
	$(element).parent().parent().css("background-color", "#60c2ff" );
}

function nextStep() {
  $('.error-form').remove();
  $('.message-form').remove();
	if($('[name="selected_medicine"]').length > 0){
		if($('[name="selected_medicine"]').is(':checked')) {
			var medicine = $('[name="selected_medicine"]:checked').val();
			var quantity = $('#quantity-select').val();
			var price = $('[name="selected_medicine"]:checked').attr('data-price');
			window.location.href = url + '/doctor/selectpharmacy?' + window.location.search.substring(1) + '&q=' + quantity + '&m=' + medicine + '&p=' + price;
		}
		else {
			html = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>No medicine has been chosen</div>';
			alert('No medicine has been chosen');
			$(html).insertBefore('#medicine_details_table');
		}
	}
	else {
		html = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>No medicine has been chosen</div>';
		alert('No medicine has been chosen');
		$(html).insertBefore('#medicine_details_table');
	}
}
