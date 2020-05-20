const express = require('express');
const router=express.Router();
const { poolPromise } = require('../../config/db')  
const sql = require('mssql')  
const bcrypt = require ('bcryptjs');
const {check, validationResult} = require('express-validator')


//@route POST/api/users 
//@desc create and register new user
//@access Public

router.post('/',[
    check('username', 'lenth must be between 3 and 8').isLength({min:3},{max: 8}),
    check('firstname', 'first name must be not empty').not().isEmpty(),
    check('lastname', 'last name must be not empty').not().isEmpty(),
    check('country', 'country must be not empty').not().isEmpty(),
    check('username', 'lenth must be between 3 and 8').isLength({min:3},{max: 8}), check('username', 'lenth must be between 3 and 8').isLength({min:3},{max: 8}),
    check('password')       
    .exists()
   .withMessage('Password should not be empty, minimum five characters, maximum eight charachters , at least one number and one special character')
   .isLength({ min: 5 },{max:10})
   .withMessage('Password should not be empty, minimum five characters, maximum eight charachters , at least one number and one special character')
   .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
   .withMessage('Password should not be empty, minimum five characters, maximum eight charachters , at least one number and one special character'),
    check('email', 'Please include a valid e-mail').isEmail(),
    check('url', 'must conatin valid url').isURL()
    ],
     async (req,res)=>  {  
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const {username,firstname,lastname,password,email,confirmpassword,url,country} = req.body;
        var duplicateUserName=false;
        var duplicateEmail=false;

        console.log(duplicateEmail)
        if(password!=confirmpassword)
        {
            return res.status(404).json({msg : 'Password does not match'});
        }

        //Password bcrypt
        const salt= await bcrypt.genSalt(10);
        cryptpassword = await bcrypt.hash(password,salt);

        //Check if user exists
         var pool = await poolPromise  
         var result = await pool.request()
        .query('select * from users',function(err, users){  
            if (err)  
            {    
           console.log(err)
            }  
            else {  
            let data = users.recordset;  
            let usernameInUse = data.some(user => user.username===username)

            //UserName taken
            if(usernameInUse){ 
                duplicateUserName=true
            }
            //Email taken
            emailInUse = data.some((user) => {return user.email===email})
            if(emailInUse){
               duplicateEmail=true;
             }
            }  
        }
    )

         pool = await poolPromise  
         result = await pool.request()
        .input("username",sql.VarChar(10), username)
        .input("firstname",sql.VarChar(4000), firstname)
        .input("lastname",sql.VarChar(4000), lastname)
        .input("country",sql.VarChar(50), country)
        .input("password",sql.VarChar('max'),cryptpassword)
        .input("email", sql.VarChar('4000'),email)
        .input("url", sql.VarChar('max'),url)
        .execute("insertUser").then(function (recordSet){
         res.send({msg: 'Success, redirect to login'})
        })  
    
    }
    catch(error){
        console.log(error.message)
        if(duplicateUserName)
        {
           return res.status(404).send('Duplicate Username'); 
        }
        if(duplicateEmail)
        {
            return res.status(404).send('Duplicate Email'); 
        }
            res.status(500).send('Server error');
    }

      
});
module.exports = router;