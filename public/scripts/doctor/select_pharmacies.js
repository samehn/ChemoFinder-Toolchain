var url = window.location.origin;
$(document).click(function() {
    $('.error-form').remove();
});

$("#next-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

function updateSelectedPharmacy(element) {
	var medicine_id = $(element).attr('name').split('_')[1];
	$('*[id^="pharmacy_row_' + medicine_id + '"]:odd').css("background-color", "#ffffff" );
	$('*[id^="pharmacy_row_' + medicine_id + '"]:even').css("background-color", "#f2f2f2" );
	$(element).parent().parent().css("background-color", "#60c2ff" );
}

function nextStep() {
	console.log($('*[id^="pharmacy_row_"]'));
	var uniqueSelectors = [];
	$('*[id^="pharmacy_row_"]').each(function( index ) {
		var row = $( this ).attr('id').split('_');
		var selector = row[0] + '_' + row[2];
	    if($.inArray(selector, uniqueSelectors) == -1) {
	    	uniqueSelectors.push(selector);
	    }

	});
	var sub_url ='';
	var flag = true;
	if(uniqueSelectors.length > 0) {	
		for (var i = 0; i < uniqueSelectors.length; i++) {
			sub_url = '&p='
			if ($('[name="' + uniqueSelectors[i] + '"]').is(':checked')) {
				sub_url = sub_url + $('[name="' + uniqueSelectors[i] + '"]:checked').val();
			}
			else {
				flag = false;
			}
			if(i !=  uniqueSelectors.length-1) {
				sub_url = sub_url + '-';
			}
		}	
	}
	if(flag) {
		window.location.href = url + '/doctor/shoppinglist?' + window.location.search.substring(1) + sub_url;
		// console.log(sub_url);
	}
	else {
		html = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>You have to choose one of the available pharmacies for each medicine</div>';
		alert('You have to choose one of the available pharmacies for each medicine');
		$(html).insertAfter('#missin-medicines');
	}
		
}