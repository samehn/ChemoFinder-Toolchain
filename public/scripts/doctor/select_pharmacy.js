var url = window.location.origin;
$(document).click(function() {
    $('.error-form').remove();
});
$("#next-btn").click(function(e) {
    e.stopPropagation();
    return false;
});

function addMedicine(element) {
	var oldHtml = $(element).parent().parent()[0].outerHTML;
	var newHtml = oldHtml.replace('<button onclick="addMedicine(this)" class="form-control btn btn-primary">Add</button>', '<button onclick="removeMedicine(this)" class="form-control btn btn-primary">Remove</button>');
	newHtml = newHtml.replace('unselected-pharmacy', 'selected-pharmacy');
	if($('.selected-pharmacy').length == 0) {
		$('#selected-pharmacy-body').html('');
	}
	$(element).parent().parent().remove();
	$('#selected-pharmacy-body').append(newHtml);
	if($('.unselected-pharmacy').length == 0) {
		$('#unselected-pharmacy-body').html('<td style="text-align: center;" valign="top" colspan="13" class="empty_table td_search">No pharmacy available</td>');
	}
	// console.log(newHtml);
}

function removeMedicine(element) {
	var oldHtml = $(element).parent().parent()[0].outerHTML;
	var newHtml = oldHtml.replace('<button onclick="removeMedicine(this)" class="form-control btn btn-primary">Remove</button>', '<button onclick="addMedicine(this)" class="form-control btn btn-primary">Add</button>');
	newHtml = newHtml.replace('selected-pharmacy', 'unselected-pharmacy');
	if($('.unselected-pharmacy').length == 0) {
		$('#unselected-pharmacy-body').html('');
	}
	$(element).parent().parent().remove();
	$('#unselected-pharmacy-body').append(newHtml);
	if($('.selected-pharmacy').length == 0) {
		$('#selected-pharmacy-body').html('<td style="text-align: center;" valign="top" colspan="13" class="empty_table td_search">No pharmacy has been chosen yet</td>');
	}
	//console.log(newHtml);
}

function nextStep() {
	if ($('.selected-pharmacy').length == 0) {
		if($('.unselected-pharmacy').length > 0) {
			html = '<div class="alert alert-danger error-form"><button class="close" data-close="alert"></button>No pharmacies has been chosen</div>';
			alert('No pharmacies has been chosen');
			$(html).insertBefore('#pharmacies_table');
		}
		else {
			$('#noPharmacies').modal('show');
		}
	}
	else {

		var data = {};
		var query = window.location.search.substring(1);
		var vars = query.split("&");
	    for (var i=0;i<vars.length;i++) {
	      	var pair = vars[i].split("=");
	      	if(pair[0] == 'q') {
	      		data['quantity'] = pair[1];
	      	}
	      	if(pair[0] == 'm') {
	      		data['medicine'] = pair[1];
	      	}
	      	if(pair[0] == 'p') {
	      		data['price'] = pair[1];
	      	}
	  	}
	  	data['pharmacies'] = [];
	  	if($('.selected-pharmacy').length > 0) {
			for (var i = 0; i < $('.selected-pharmacy').length; i++) {
				var pharmacy_id = $($('.selected-pharmacy')[i]).attr('data-id');
				data['pharmacies'].push(pharmacy_id);
			}
		}
	  	$('#loadingModal').modal('show');
	  	$.ajax({
	      type: "post",
	      url: url +'/doctor/savemedicinesession',
	      data : data,
	      success:  function(result){
	      	$('#loadingModal').modal('hide');
	      	if(result.message == 'success') {
	      		$('#completeSearch').modal('show');
	      	}
	      }
	  	});
	}
}

function selectAnotherMedicine() {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
  var param = "";
  for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      	if(pair[0] == 't') {
      		param = param.concat("t=",pair[1]);
      	}
        if(pair[0] == 'pid'){
          param = param.concat("&pid=",pair[1]);
        }
    }
    window.location.href = url + '/doctor/selectmedicine?' + param;
}

function goShoppingList() {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
  var param = "";
  for (var i=0;i<vars.length;i++) {
    	var pair = vars[i].split("=");
      	if(pair[0] == 't') {
      		param = param.concat("t=",pair[1]);
      	}
        if(pair[0] == 'pid'){
          param = param.concat("&pid=",pair[1]);
        }
    }
    console.log("goshopping list param " + param)
    window.location.href = url + '/doctor/shoppinglist?' + param;
}

function continueSearch() {
	$('#noPharmacies').modal('hide');
	$('#completeSearch').modal('show');
}

function saveMedicine() {
	var data = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      	var pair = vars[i].split("=");
      	if(pair[0] == 'q') {
      		data['quantity'] = pair[1];
      	}
      	if(pair[0] == 'm') {
      		data['medicine'] = pair[1];
      	}
  	}
  	data['pharmacies'] = [];
  	$('#noPharmacies').modal('hide');
  	$('#loadingModal').modal('show');
  	$.ajax({
      type: "post",
      url: url +'/doctor/savemedicinesession',
      data : data,
      success:  function(result){
      	$('#loadingModal').modal('hide');
      	console.log(result);
      	if(result.message == 'success') {
      		$('#completeSearch').modal('show');
      	}
      }
  	});
}
