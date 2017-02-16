var ibmdb = require('ibm_db');
var db2;
var hasConnect = false;
if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    if (env['dashDB']) {
        hasConnect = true;
        db2 = env['dashDB'][0].credentials;
    }
    
}

if ( hasConnect == false ) {

   db2 = {
        db: "BLUDB",
        hostname: "dashdb-entry-yp-dal09-10.services.dal.bluemix.net",
        port: 50000,
        username: "dash5082",
        password: "XphM9lInA9M8"
     };
}

var connString = "DRIVER={DB2};DATABASE=" + db2.db + ";UID=" + db2.username + ";PWD=" + db2.password + ";HOSTNAME=" + db2.hostname + ";port=" + db2.port;

module.exports = {
    connString:connString,
    ibmdb:ibmdb
}
