function generate_random_password_helper(){};

generate_random_password_helper.prototype.constructor = generate_random_password_helper;

var RandExp = require('randexp');

generate_random_password_helper.prototype.generate_random_password = function(req, res) {
    var random = new RandExp(/(?=.*[A-Za-z\d])@[A-Za-z\d]{8,10}/).gen();
    res.send({random: random});
}

module.exports = new generate_random_password_helper();