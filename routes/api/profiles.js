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

//@route GET/api/profiles/:id
//@desc get information about spesific recipe from external API 
//@access Private
router.get('/myprofile',auth, async function(req,res,next){
    try{
        var pool = await poolPromise  
        var result = await pool.request()
       .query(`select * from profile where username = '${req.user}' `,function(err, recipes){  
           if (err)
           next(error)

           else {  
           let userProfile = recipes.recordset; 
           return res.status(200).json(userProfile) 
           }  
       })
    }
 catch(error)
 {
    next(error)
 }

})

//@route POST/api/profiles
//@create new profile of user
//@access Private
router.post('/',auth, async function(req,res,next){
    try{
        pool = await poolPromise  
        result = await pool.request()
       .input("username",sql.VarChar(10), req.user)
       .input("watchedRecipe",sql.VarChar('max'),[])
       .input("favoriteRecipe",sql.VarChar(4000), [])
       .input("familyRecipe",sql.VarChar(4000), [])
       .input("lastWatched",sql.VarChar(4000), [])
       .execute("insertProfile").then(function (recordSet){
        return res.status(200).json({msg: 'New profile creatre d'})
       })  
    }
 catch(error)
 {
    next(error);
 }
})

//@route POST/api/profiles
//@update new favorite recipe
//@access Private
router.put('/favorite',auth,[check('id', 'must be not empty').not().isEmpty()],async function(req,res,next){
   try{
      //validate if input not null
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
      }

      const {id} = req.body;

      pool = await poolPromise  
      result = await pool.request()
      .query(`select * from profile where username =  '${req.user}'`,async function(err, user){  
      if (err){
         next(err)
      }
      //check if already saved in favorites
      favoriteRecipe=JSON.parse("["+user.recordset[0].favoriteRecipe+"]");
      recipeNotWatched = favoriteRecipe.some(recId => {
          return recId.toString()===id.toString()
      }) 

      if(!recipeNotWatched){
       favoriteRecipe.push(id)
       await pool.request()
      .query(`update profile set favoriteRecipe = '${id}' where username =  '${req.user}'`,function(err, user){
      return res.status(200).json({message: 'Favorite recipe succesfuly added', sucess:'true'})
      })
     }
      else{
      next(createError(400,'The recipe already exists'))
      }
      })
   }
      catch(error)
      {
         next(error);
      }
})



module.exports = router;