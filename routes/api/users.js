const express = require('express');
const router=express.Router();
const auth = require('../../middlewares/auth');
const bcrypt = require ('bcryptjs');
const createError = require('http-errors')
const {check, validationResult} = require('express-validator')
const db_actions = require('../utils/db_actions')


//@route POST/api/users 
//@desc create and register new user
//@access Public

router.post('/',[
    check('username', 'length must be between 3 and 8').isLength({min:3,max:8}),
    check('firstname', 'first name must be not empty').not().isEmpty(),
    check('lastname', 'last name must be not empty').not().isEmpty(),
    check('country', 'country must be not empty').not().isEmpty(),
    check('password')       
    .exists()
    .withMessage('Password should not be empty, minimum five characters, maximum eight charachters , at least one number and one special character')
    .isLength({ min:5,max:10})
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
  
        const {username,password,confirmpassword} = req.body;

        if(password!=confirmpassword)
            return next(createError(404,'Password does not match'));
        

        //Password bcrypt
        const salt= await bcrypt.genSalt(10);
        cryptpassword = await bcrypt.hash(password,salt);

        await db_actions.insertUser(req.body,cryptpassword,next);

        await db_actions.insertProfile(req, username, next);

        return res.status(200).json({msg: 'New User and profile created', success : 'true'})
      }
    catch(error){
        next(error);
    }
});
//@route GET/api/users 
//@desc get user details
//@access Private

router.get('/', auth , async(req,res,next) =>{

    try{
        let result = await db_actions.getUser(req.session.userId)
        if(result.recordset.length === 0)
            return  next(createError(400,'Username is not exists'));
        else{
        return res.status(200).json(result.recordset[0])
        }
    }
    catch(err){
        next(err)
    }
})


module.exports = router;