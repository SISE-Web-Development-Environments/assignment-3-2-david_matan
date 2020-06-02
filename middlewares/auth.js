const { poolPromise } = require('../config/db')  
const sql = require('mssql')  

module.exports = async (req,res,next) => {
//Check if seassion exists
if(!(req.session && req.session.userId)){

    return res.status(401).json({msg: 'No session, authorization denied'});
}

    var pool = await poolPromise  
    var result = await pool.request()
    .query(`select * from users where username =  '${req.session.userId}'`,function(err, user){  
        if (err) {
            return res.status(401).json({msg: err});
        }
        if(!user)
        {
            return res.status(401).json({msg: 'No session, authorization denied'});
        }

     user.password= undefined;
     
     req.user = req.session.userId;
     //Access user variable in any html templates
     res.locals.user = user;

     next();
    });  
}


