const express = require('express');
const router=express.Router();
const { poolPromise } = require('../../config/db')  
const sql = require('mssql')  
const bcrypt = require ('bcryptjs');
const {check, validationResult} = require('express-validator')


//@route POST/api/auth 
//@desc Log in user
//@access Public
router.post('/',[
    check('username', 'Name is required').not().isEmpty(),
    check('password', 'Password is required').exists()
],
    async (req,res)=>  {  
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        const {username,password} = req.body;
        var pool = await poolPromise  
        var result = await pool.request()
        .query(`select * from users where username = '${username}'`, async function(err, result) {  
            user=result.recordset[0]
            if (err) 
            {
                return res.status(400).json({msg: err});
            }
            if(!user)
            {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }]});
            }
            // encrypt user password and validate
            else{
            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch)
            {
                return res.status(400).json({errors: [{msg: 'Invalid Credentials' }]});
            }

            req.session.userId = username;
            console.log(res)
            res.status(200).json({msg: res.headers})
            }
            })   
    }
    catch(error){
        console.error(error.msg)
        res.status(500).send('Server error');
}
    })

    module.exports = router;