function reports(){
	tomodel = {};
	user_model 	= require('../../models/user_model');
    medicine_model  = require('../../models/medicine_model');
    stock_list_model  = require('../../models/stock_list_model');
    shopping_list_model = require('../../models/shopping_list_model');
};
reports.prototype.constructor = reports;

reports.prototype.reports_page =  function(req, res) {

    res.render('admin/reports');

}

reports.prototype.download_shopping_list =  function(req, res) {
    // create workbook by api.
		console.log("****************************************** reports.js controller ************************************");
    var workbook = new controller.Excel.Workbook();

    // must create one more sheet.
    var worksheet = workbook.addWorksheet("Sheet1");

    worksheet.views = [
        {zoomScale:66}
    ];
    // Add a row by contiguous Array (assign to columns A, B & C)
    worksheet.addRow(['Operation ID','Operation Time', 'Doctor ID', 'Treatment Center', 'Patient ID', 'Medicine ID', 'Pharmacy ID','Pharmacy Name', 'Medicine Brand Name', 'Medicine Generic Name', 'Medicine Manufacturer', 'Medicine Quantity', 'Medicine Form', 'Medicine Strength', 'Medicine Strenght Unit', 'Expiry Date', 'Pack Size', 'Price Per Pack' ]);
    var str = "ABCDEFGHIJKLMNOPQR";
    for(var i=0; i<str.length; i++)
    {
        var char = str.charAt(i);
        worksheet.getCell(char + '1').fill = {
            type: 'pattern',
            pattern:'solid',
            // fgColor:{argb:'0001'},
            fgColor:{argb:'FF203764'}
        };
        // for the wannabe graphic designers out there
        worksheet.getCell(char + '1').font = {
            name: 'Arial',
            color: { argb: 'FFFFFFFF' },
            // family: 4,
            size: 10,
            bold: true
        };
        worksheet.getCell(char + '1').alignment = { wrapText: true };
        var dobCol = worksheet.getColumn(char);
        if(char == 'A',char == 'B' || char == 'H' || char == 'K'|| char == 'P') {
            dobCol.width = 30;
        }
				else {
            dobCol.width = 20;
        }
    }

		// function downloadShoppingList(){
		// 	alert("down laod shopping list");
		// }

  shopping_list_model.async_download_shopping_list(function(shopping_list) {
			console.log('Download shopping list report, admin id = ' + req.session.admin_id);
			console.log("*******************************************************");
				if(shopping_list.length > 0) {
            for (var i = 0; i < shopping_list.length; i++) {
							worksheet.addRow([shopping_list[i].OP_ID, shopping_list[i].OPERATION_TIME, shopping_list[i].DOCTOR_ID, shopping_list[i].TREATMENT_CENTR_ID, shopping_list[i].PATIENT_ID, shopping_list[i].MED_ID, shopping_list[i].PHARMACY_ID, shopping_list[i].ENTITY_NAME, shopping_list[i].MEDICINE_BRAND_NAME , shopping_list[i].MEDICINE_GENERIC_NAME , shopping_list[i].MEDICINE_MANUFACTURER , shopping_list[i].MEDICINE_QUANTITY , shopping_list[i].MEDICINE_FORM,  shopping_list[i].MEDICINE_STRENGTH, shopping_list[i].MEDICINE_STRENGTH_UNIT  , shopping_list[i].EXPIRY_DATE, shopping_list[i].PACK_SIZE , shopping_list[i].PRICE_PER_PACK]);
            }
            var path = './public/uploads/shopping_list/shopping_list' + req.session.admin_id + '_' + Date.now() + '.xlsx';
            if(controller.fs.existsSync(path)) {
                controller.fs.unlinkSync(path);
            }
            // you can create xlsx file now.
            workbook.xlsx.writeFile(path).then(function() {
                console.log("xlsx file is written.");
                res.download(path, 'shopping_list.xlsx', function(err){
                  //CHECK FOR ERROR
                  controller.fs.unlink(path);
                });
            });
        }
        else {
            req.session.admin_shopping_list_report_error = '<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> There is no shopping list to be downloaded </div>';
            res.redirect('reports');
        }
    });
}

reports.prototype.download_stock_list  =  function(req, res) {
	// create workbook by api.
	var workbook = new controller.Excel.Workbook();

	// must create one more sheet.
	var worksheet = workbook.addWorksheet("Sheet1");

	worksheet.views = [
			{zoomScale:66}
	];
	// Add a row by contiguous Array (assign to columns A, B & C)
	worksheet.addRow(['ID', 'Generic Name', 'Form', 'Strength', 'Strength unit', 'Brand name', 'Manufacturer', 'Batch Number', 'Expiry Date (dd-mm-yyyy)', 'Current Stringent Regulatory Authority (SRA) Approvals', 'Pack Size', 'Price per Pack', 'Available Stock (Packs)', 'Average Monthly Consumption (AMC) in Packs' , 'Pharmacy ID' , 'Pharmacy Name']);

	var str = "ABCDEFGHIJKLMNOP";
	for(var i=0; i<str.length; i++)
	{
			var char = str.charAt(i);
			worksheet.getCell(char + '1').fill = {
					type: 'pattern',
					pattern:'solid',
					// fgColor:{argb:'0001'},
					fgColor:{argb:'FF203764'}
			};
			// for the wannabe graphic designers out there
			worksheet.getCell(char + '1').font = {
					name: 'Arial',
					color: { argb: 'FFFFFFFF' },
					// family: 4,
					size: 10,
					bold: true
			};
			worksheet.getCell(char + '1').alignment = { wrapText: true };
			var dobCol = worksheet.getColumn(char);
			if(char == 'B' || char == 'E' || char == 'F'|| char == 'I'|| char == 'J'|| char == 'N' || char == 'P') {
					dobCol.width = 30;
			}
			else {
					dobCol.width = 20;
			}
	}
	//tomodel.user_id = req.session.pharmacy_id;

	stock_list_model.async_select_stock_list( function(stock_list) {
			if(stock_list.length > 0) {
					for (var i = 0; i < stock_list.length; i++) {
						console.log("*******stock_list[i].PHARMACY_ID" + stock_list[i].PHARMACY_ID + "stock_list[i].ENTITY_NAME" + stock_list[i].ENTITY_NAME);
							worksheet.addRow([stock_list[i].ID, stock_list[i].GENERIC_NAME, stock_list[i].FORM, stock_list[i].STRENGTH, stock_list[i].STRENGTH_UNIT, stock_list[i].BRAND_NAME, stock_list[i].MANUFACTURER, stock_list[i].BATCH_NUMBER, stock_list[i].EXPIRY_DATE, stock_list[i].SRA, stock_list[i].PACK_SIZE, stock_list[i].PRICE_PER_PACK, stock_list[i].AVAILABLE_STOCK, stock_list[i].AVG_MONTHLY_CONSUMPTION, stock_list[i].PHARMACY_ID , stock_list[i].ENTITY_NAME]);
					}
					var path = './public/uploads/stocks/stock_list_' + req.session.admin_id + '_' + Date.now() + '.xlsx';
					if(controller.fs.existsSync(path)) {
							controller.fs.unlinkSync(path);
					}
					// you can create xlsx file now.
					workbook.xlsx.writeFile(path).then(function() {
							console.log("xlsx file is written.");
							res.download(path, 'stock_list.xlsx', function(err){
								//CHECK FOR ERROR
								controller.fs.unlink(path);
							});
					});
			}
			else {
					req.session.stock_format_error = '<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> There are no stocks to be downloaded </div>';
					res.redirect('/admin/reports');
			}
	});
}
module.exports = new reports();
