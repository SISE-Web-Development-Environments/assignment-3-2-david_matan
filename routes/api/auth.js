const express = require('express');
const router=express.Router();
const bcrypt = require ('bcryptjs');
const {check, validationResult} = require('express-validator')
const createError = require('http-errors')
const db_actions = require('../utils/db_actions')
const auth = require('../../middlewares/auth');

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
        //Retrieve the user from db
        let result = await db_actions.getUser(username)
        console.log(result)
        if(result.recordset.length === 0)
            return  next(createError(400,'Username is not exists'));
        // encrypt user password and validate
        else{
          let user=result.recordset[0];
          const isMatch = await bcrypt.compare(password,user.password);
           if(!isMatch)
               return next(createError(400, 'Password incorrect'));

          req.session.userId = username;
          res.status(200).json({message: req.cookies.session, success : 'true'})
        }
    }
    catch(error){
        next(error)
    }
    })


//@route GET/api/auth 
//@desc Log out user
//@access private
router.get('/logout',auth, (req,res,next)=>  {  
    try{
        req.session.reset();
        res.status(200).json({message : "Successfully logout" , success : 'True'})
    }
    catch(error){
        next(error)
    }
    })


    module.exports = router;