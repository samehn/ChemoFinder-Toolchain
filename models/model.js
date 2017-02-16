db = require('../config/db'); 


function dbQuery(query, callback) {
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

function dbQuerySync(query) {
    var option = { connectTimeout : 3000000 };// Connection Timeout after 40 seconds. 
    var conn = db.ibmdb.openSync(db.connString, option);
    var rows = conn.querySync(query);
    // console.log(query);
    // console.log(rows);
    return rows;
}

module.exports = {
    dbQuery:dbQuery,
    dbQuerySync:dbQuerySync
}