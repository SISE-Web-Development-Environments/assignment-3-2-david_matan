const express = require('express');
const router=express.Router();
const { poolPromise } = require('../../config/db')  
const sql = require('mssql')  
const bcrypt = require ('bcryptjs');
const {check, validationResult} = require('express-validator')
const createError = require('http-errors')

//@route POST/api/auth 
//@desc Log in user
//@access Public
router.post('/',[
    check('username', 'Name is required').not().isEmpty(),
    check('password', 'Password is required').exists()
],
    async (req,res,next)=>  {  
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty())
             next(errors)
        const {username,password} = req.body;
        var pool = await poolPromise  
        var result = await pool.request()
        .query(`select * from users where username = '${username}'`, async function(err, result) {  
            user=result.recordset[0]
            if (err) 
               next(err)
            if(!user)
               next(createError(400, {msg: 'Invalid Credentials'}));

            // encrypt user password and validate
            else{
            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch)
              next(createError(400, {msg: 'Invalid Credentials', success:'false' }));

            req.session.userId = username;
            res.status(200).json({msg: res.headers})
            }
            })   
    }
    catch(error){
        next(error)
    }
    })

    module.exports = router;