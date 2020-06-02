const express = require('express');
const router=express.Router();
const { poolPromise } = require('../../config/db')  
const sql = require('mssql')  
const bcrypt = require ('bcryptjs');
const createError = require('http-errors')
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
    .matches(/.*[0-9]+.*[\\\^\$\.\|\?\*\+\(\)\[\]\!\{]+/)
    .withMessage('Password should not be empty, minimum five characters, maximum eight charachters , at least one number and one special character'),
    check('email', 'Please include a valid e-mail').isEmail(),
    check('url', 'must conatin valid url').isURL()
    ],
    async (req,res,next)=>  {  
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
  
        const {username,firstname,lastname,password,email,confirmpassword,url,country} = req.body;
        var duplicateUserName=false;
        var duplicateEmail=false;

        if(password!=confirmpassword)
            return next(createError(404,'Password does not match'));
        

        //Password bcrypt
        const salt= await bcrypt.genSalt(10);
        cryptpassword = await bcrypt.hash(password,salt);

        //Check if user exists
        var pool = await poolPromise  
        var result = await pool.request()
        .query('select * from users',async function(err, users){ 
          if (err)   
            return next(err)
         
          let data = users.recordset;  
          let usernameInUse = data.some(user => {return user.username===username})

            //UserName taken
           if(usernameInUse)
               return next(createError(404,'User already exists'))
            
            //Email taken
            emailInUse = data.some((user) => {return user.email===email})
            if(emailInUse)
                return next(createError(404,'Email already exists'))
             
            await pool.request()
             .input("username",sql.VarChar(10), username)
             .input("firstname",sql.VarChar(4000), firstname)
             .input("lastname",sql.VarChar(4000), lastname)
             .input("country",sql.VarChar(50), country)
             .input("password",sql.VarChar('max'),cryptpassword)
             .input("email", sql.VarChar('4000'),email)
             .input("url", sql.VarChar('max'),url)
             .execute("insertUser").then(async function (recordSet){
                 await pool.request()
                .input("username",sql.VarChar(10), username)
                .input("watchedRecipe",sql.VarChar('max'),[])
                .input("favoriteRecipe",sql.VarChar(4000), [])
                .input("familyRecipe",sql.VarChar(4000), [])
                .input("lastWatched",sql.VarChar(4000), [])
                .execute("insertProfile").then(function (recordSet){
                    return res.status(200).json({msg: 'New User and profile creatred', success: 'true'})
                })  
            })
       })
    }
    catch(error){
        next(error);
    }

      
});
module.exports = router;