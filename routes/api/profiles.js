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
   
      const {id} = req.body;
      let result = await db_actions.getUserSpesificRecipe(id,next);

      //Check if the recipe belong to user
      if(result.recordset && result.recordset.length!=0)
      await recipes_actions.addToFavorite(id,req.user,'user',next,res)

      else{
      //Check if this recipe is belong to API
      await recipes_actions.getRecipeInfo(id);
      await recipes_actions.addToFavorite(id,req.user,'spooncalur',next,res);
      
 
      res.status(200).json({msg: "Recipe successfuly added" , success: 'true'}) 

   }
}
   catch(error){
      next(error);
   }
})



module.exports = router;