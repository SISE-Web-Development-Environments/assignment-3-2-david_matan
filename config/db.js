const sql = require("mssql")
require("dotenv").config();


// Create connection to database
const config = {
      user: process.env.tedious_userName,
      password: process.env.tedious_password,
      server: process.env.tedious_server,
      database: process.env.tedious_database,
      options: {
        "encrypt": true,
        "enableArithAbort": true
        },
};


// Attempt to connect and execute queries if connection goes through

const poolPromise = new sql.ConnectionPool(config)  
.connect()  
.then(pool => {  
console.log('Connected to MSSQL')  
return pool  
})  
.catch(err => console.log('Database Connection Failed! Bad Config: ', err))  
module.exports = {  
sql, poolPromise  
}  