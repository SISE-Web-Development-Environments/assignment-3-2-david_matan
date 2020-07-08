const express = require('express');
const router=express.Router();
const { poolPromise } = require('../../config/db')  
const {check, validationResult} = require('express-validator')
const auth = require('../../middlewares/auth');
const db_actions = require('../utils/db_actions')
const createError = require('http-errors')
const recipes_actions = require('../utils/recipes_actions')

//@route GET/api/profiles/myprofile
//@desc get information about spesific recipe from external API 
//@access Private
router.get('/myprofile',auth, async function(req,res,next){
   try{

      let result = await db_actions.getProfile(req.user,next)
      if(!result)
         return next(createError(404,'Profile doesnt exists'))
      if(result.recordset.length === 0)
         return next(createError(404,'Profile doesnt exists'))
      
      let userProfile = result.recordset[0]; 
      if(userProfile.watchedRecipe!='')
      userProfile.watchedRecipe= JSON.parse(userProfile.watchedRecipe)
      if(userProfile.favoriteRecipe!='')
      userProfile.favoriteRecipe= JSON.parse(userProfile.favoriteRecipe)
      if(userProfile.lastWatched!='')
      userProfile.lastWatched= JSON.parse(userProfile.lastWatched)
      return res.status(200).json(userProfile) 
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
   
      const {id,type} = req.body;
      //Check if the recipe belong to user
      if(type==='user'){
      await recipes_actions.addToFavorite(id,req.user,'user',next,res)
      }
      //Check if the recipe belong to family
      else if(type==='family'){
      await recipes_actions.addToFavorite(id,req.user,'family',next,res)
      }
       //Check if this recipe is belong to API
      else{
      await recipes_actions.addToFavorite(id,req.user,'spooncalur',next,res);
      }
 
      res.status(200).json({msg: "Recipe successfuly added" , success: 'true'}) 

   }
   catch(error){
      next(error);
   }
})

//@route GET/api/profile/lastwatch
//@desc get information about last watch recipe of user
//@access Private
router.get('/lastwatch',auth, async function(req,res,next){
   try {
     let result = await db_actions.getProfile(req.user,next)
     if(!result)
         return next(createError(404,'Profile doesnt exists'))
     if(result.recordset.length === 0)
         return next(createError(404,'Profile doesnt exists'))
 
     var lastWatchRecipes=[]
     let userProfile = result.recordset[0]; 
     let newone;
     //if there is last watch recipe so return preview
     if(userProfile.lastWatched!==''){
       userProfile.lastWatched= JSON.parse(userProfile.lastWatched)
     //Promise for all requests
        newone = await  Promise.all(userProfile.lastWatched.map(async recipeId => {
     //If from api so
         if(recipeId.type==='api'){
           const get_information= await  recipes_actions.getRecipeInfo(recipeId.id)
           preview= await  recipes_actions.createPreviewRecipe(get_information.data,'spooncalur')
           lastWatchRecipes.push(preview)
           return lastWatchRecipes
           }
     //if else from user
          else if(recipeId.type==='user'){
           result = await db_actions.getUserSpesificRecipe(recipeId.id,next)
           recipe = result.recordset[0];
           preview=recipes_actions.createPreviewRecipe(recipe,'user')
           lastWatchRecipes.push(preview)
           return lastWatchRecipes
           }
      // else from family
           else
           result = await db_actions.getUserFamilySpesificRecipe(recipeId.id,next)
           recipe = result.recordset[0];
           preview=recipes_actions.createPreviewRecipe(recipe,'family')
           lastWatchRecipes.push(preview)
           return lastWatchRecipes
         }
       ))
   } 
         res.status(200).send(lastWatchRecipes);
   }
   catch (err){
      next(err)
   }
 });

module.exports = router;