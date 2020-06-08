const express = require('express');
const router=express.Router();
const { poolPromise } = require('../../config/db')  
const uniqid = require('uniqid');
const sql = require('mssql')  
const {check, validationResult} = require('express-validator')
const auth = require('../../middlewares/auth');
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const createError = require('http-errors')
const recipes_actions = require('../utils/recipes_actions')

//@route GET/api/profiles/myprofile
//@desc get information about spesific recipe from external API 
//@access Private
router.get('/myprofile',auth, async function(req,res,next){
   try{
        var pool = await poolPromise  
        var result = await pool.request()
       .query(`select * from profile where username = '${req.user}' `,function(err, recipes){  
           if (err)
             return next(error)
            
           if(recipes.recordset.length === 0)
             return next(createError(404,'Profivle doesnt exists'))

           else {  
           let userProfile = recipes.recordset[0]; 
           return res.status(200).json(userProfile) 
           }  
       })
    }
   catch(error){
    next(error)
    }
})



//@route PUT/api/favorite
//@update new favorite recipe
//@access Private
router.put('/favorite',auth,[check('id', 'must be not empty').not().isEmpty()],async function(req,res,next){
   try{
      //validate if input not null
      const errors = validationResult(req)
      if(!errors.isEmpty())
         return res.status(400).json({ errors: errors.array() });
   
      const {id} = req.body;
      pool = await poolPromise  
      result2 = await pool.request()
      .query(`select * from recipes where id =  '${id}'`,async function(err, user){  
         if (err)
            return next(err)
         //Check if the recipe belong to user
         if(user.recordset.length !== 0)
            recipes_actions.addToFavorite(id,req.user,'user',next,res)
         else
         {
         //Check if this recipe is belong to API
            try{
            let exists= await recipes_actions.getRecipeInfo(id)
            recipes_actions.addToFavorite(id,req.user,'spooncalur',next,res)
            }
           catch(err) {
              next(err)
           }
         }
      })
   }
   catch(error){
      next(error);
   }
})



module.exports = router;