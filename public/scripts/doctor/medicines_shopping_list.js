var url = window.location.origin;
$(document).click(function() {
    $('.error-form').remove();
});

function printPage() {
	window.print();
	return true;
}