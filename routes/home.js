module.exports = function (app) {

  app.get('/', function(req, res){
	var base = req.protocol + '://' + req.get('host');
	res.render('home', { base: base });
  });

}