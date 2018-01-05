var model = function() {
    db = require('../config/db');
};

model.prototype.dbQuery = function(query, callback) {
    var result;
    db.ibmdb.open(db.connString, function(err, conn) {
        console.log(query);
            if (err ) {
             return "error occurred " + err.message;
            }
            else {
                conn.query(query, function(err, tables, moreResultSets) {
                    result = tables;
                    /*
                        Close the connection to the database
                        param 1: The callback function to execute on completion of close function.
                    */
                    // console.log(err);
                    // console.log(result);
                    conn.close(function(){
                        console.log("Connection Closed");
                        });
                    // console.log(result);
                    return callback(result);
                });

            }
        } );
}

model.prototype.dbQuerySync = function(query) {
    var option = { connectTimeout : 3000000 };// Connection Timeout after 40 seconds.
    var conn = db.ibmdb.openSync(db.connString, option);
    var rows = conn.querySync(query);
    // console.log(query);
    // console.log(rows);
    return rows;
}

model.prototype.mysql_real_escape_string = function(str) {
    str = "" + str;
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        var m = ['\\0', '\\x08', '\\x09', '\\x1a', '\\n', '\\r', "'", '"', "\\", '\\\\', "%"];
        var r = ['\\\\0', '\\\\b', '\\\\t', '\\\\z', '\\\\n', '\\\\r', "''", '""', '\\\\', '\\\\\\\\', '\\%'];
        return r[m.indexOf(char)];
    });
}

model.prototype.mysql_upper_case_real_escape_string = function(str) {
    str = this.mysql_real_escape_string(str);
    return str.toUpperCase();
}

module.exports = new model();
