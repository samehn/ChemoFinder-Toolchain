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

	if(generic_name && form) {
		var data = {generic_name: generic_name, form: form};
		console.log(data);
		$.ajax({
	      type: "post",
	      url: url +'/doctor/selectmedicinedetails',
	      data : data,
	      success:  function(result){
	      	console.log(result);
	      	$('#medicinesDetails').html('<tr class="tr_search"><td style="text-align: center;" valign="top" colspan="7" class="empty_table td_search">No medicines are chosen yet</td></tr>');
	      	if(result.message == 'success') {
	      		if(result.medicines.length > 0) {
	      			var html = '';
	      			for (var i = 0; i < result.medicines.length; i++) {
	      				html = html + '<tr class="tr_search">' +
	      									'<td class="td_search">' + 
                            					'<input type="radio" name="selected_medicine" value=' + result.medicines[i].ID + ' onclick="updateSelectedMedicine(this)">' +
                            				'</td>'	+
                            				'<td class="td_search">' + result.medicines[i].GENERIC_NAME + '</td>' +
                            				'<td class="td_search">' + result.medicines[i].BRAND_NAME + '</td>' +
                            				'<td class="td_search">' + result.medicines[i].FORM + '</td>' +
                            				'<td class="td_search">' + result.medicines[i].STRENGTH + '</td>' +
                            				'<td class="td_search">' + result.medicines[i].STRENGTH_UNIT + '</td>' +
                            				'<td class="td_search">' + result.medicines[i].MANUFACTURER + '</td>' +
                            			'</tr>';        			
	      			}
	      			$('#medicinesDetails').html(html);
	      			$('.tr_search:odd').css("background-color", "#ffffff" );
					$('.tr_search:even').css("background-color", "#f2f2f2" );
	      		}
	      	}
	      }
	  	});
	}
	else {
		$('#medicinesDetails').html('<tr class="tr_search"><td style="text-align: center;" valign="top" colspan="7" class="empty_table td_search">No medicines are chosen yet</td></tr>');
	}
}

function updateSelectedMedicine(element) {
	$('.tr_search:odd').css("background-color", "#ffffff" );
	$('.tr_search:even').css("background-color", "#f2f2f2" );
	$(element).parent().parent().css("background-color", "#60c2ff" );
}

function nextStep() {
	if($('[name="selected_medicine"]').length > 0){
		if($('[name="selected_medicine"]').is(':checked')) {
			var medicine = $('[name="selected_medicine"]:checked').val();
			var quantity = $('#quantity-select').val();
			window.location.href = url + '/doctor/selectpharmacy?' + window.location.search.substring(1) + '&q=' + quantity + '&m=' + medicine;
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
