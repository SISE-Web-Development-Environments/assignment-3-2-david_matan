const express = require('express');
const router=express.Router();
const { poolPromise } = require('../../config/db')  
const uniqid = require('uniqid');
const sql = require('mssql')  
const {check, validationResult} = require('express-validator')
const auth = require('../../middlewares/auth');
const api_domain = "https://api.spoonacular.com/recipes";
const createError = require('http-errors')
const axios = require("axios");
const recipes_actions = require('../utils/recipes_actions')
const  update_watch = require('../utils/update_watch')
const db_actions = require('../utils/db_actions')


//@route GET/api/recipes 
//@desc get all users recipes
//@access Private
router.get('/',auth, async function(req,res,next){
  try {
      recipes=await db_actions.getUserRecipes(req.user,next)
      if(!recipes)
        return next(createError(404,'Recipes doesnt exists'))
      let preview=[]
      recipes.map((recipe) =>{
      preview.push(recipes_actions.createPreviewRecipe(recipe,'user'))
      })
      res.status(200).send({preview});
  }
  catch (err){
    next(err);
  }
  })


//@route GET/api/recipes/userecipe
//@desc get information about spesific recipe from user private recipes
//@access Private
router.get('/userecipe/:id',auth, async function(req,res,next){
  try {
    
    result = await db_actions.getUserSpesificRecipe(req.params.id,next)

    if(result.recordset.length==0||!result.recordset)
      return next(createError(404,'Recipe doesnt exists'))
    let recipe = result.recordset[0];
    //If i try to get no my recipe
    if(recipe.username!==req.user)
      return next(createError(404,'Recipe doesnt exists'))

      recipe.ingredients=JSON.parse(recipe.ingredients);
      recipe.instructions=JSON.parse(recipe.instructions);
    //Save the recipe in user watched history recipes
      await update_watch.updateLastWatchRecipe(req.user,req.params.id,'user',next)
    //Save the recipe in lastWatched recipes
      await update_watch.updateWatchHistoryRecipes(req.user,req.params.id,'user',next)
      res.status(200).send(recipe)
    }
  
    catch (err) {
      next(err);
  }})


//@route GET/api/recipes/familyrecipe/:id
//@desc get information about family recipe of user private familyrecipes
//@access Private
router.get('/familyrecipes/:id',auth, async function(req,res,next){
  try {
      result = await db_actions.getUserFamilySpesificRecipe(req.params.id,next);

      if(result.recordset.length==0||!result.recordset)
       return next(createError(404,'Recipe doesnt exists'))
      let recipe = result.recordset[0];
      //If i try to get no my recipe
      if(recipe.username!==req.user)
       return next(createError(404,'Recipe doesnt exists'))

      recipe.ingredients=JSON.parse(recipe.ingredients);
      recipe.instructions=JSON.parse(recipe.instructions);
      //Save the recipe in user watched history recipes
      await update_watch.updateLastWatchRecipe(req.user,req.params.id,'family',next)
      //Save the recipe in lastWatched recipes
      await update_watch.updateWatchHistoryRecipes(req.user,req.params.id,'family',next)

      res.status(200).send(recipe)
  } 
  catch (err){
    next(err);
  }
});


//@route GET/api/recipes/familyrecipe
//@desc get all familyrecipes
//@access Private
router.get('/familyrecipes',auth, async function(req,res,next){
  try {
      recipes=await db_actions.getFamilyRecipe(req.user,next)
      if(!recipes)
      return next(createError(404,'Recipes doesnt exists'))
      let preview=[]
      recipes.map((recipe) =>{
      preview.push(recipes_actions.createPreviewRecipe(recipe,'family'))
      })
        res.status(200).send({preview});
    }
  catch (err) {
    next(err);
  }
});


//@route POST/api/recipes/familyrecipe
//@desc create new familyrecipe ofuser
//@access Private
router.post('/familyrecipes',auth, [
check('title', 'name must be not empty').not().isEmpty(),
check('image', 'image must be not empty and contain url').not().isEmpty().isURL(),
check('readyInMinutes', 'time must be not empty and integer').not().isEmpty().isInt(),
check('glutenFree', 'isGluten must be not empty and boolean').not().isEmpty().isBoolean(),
check('vegetarian', 'isVegaterian must be not empty and boolean').not().isEmpty().isBoolean(),
check('belongs', 'belongs must contain at leat 1 family member').not().isEmpty(),
check('wichtime', 'wichtime must be not empty').not().isEmpty(),
check('ingredients', 'ingredients must be not null').not().isEmpty(),
check('servings', 'serving must be not null').not().isEmpty(),
check('instructions', 'instructions must be not null').not().isEmpty()
], async function(req,res,next){
  try{
    const errors = validationResult(req)
    if(!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
      
      //Generate uniqe id for recipe
      const id=uniqid();
      db_actions.insertNewFamilyRecipe(req.body,id,res,req.session.userId)
  }
  catch (err) {
     next(err);
   }
});


//@route POST/api/recipes 
//@desc create new recipe of user
//@access Private
router.post('/',auth, [
check('title', 'name must be not empty').not().isEmpty(),
check('image', 'image must be not empty and contain url').not().isEmpty().isURL(),
check('readyInMinutes', 'time must be not empty and integer').not().isEmpty().isInt(),
check('glutenFree', 'isGluten must be not empty and boolean').not().isEmpty().isBoolean(),
check('vegetarian', 'isVegaterian must be not empty and boolean').not().isEmpty().isBoolean(),
check('ingredients', 'ingredients must be not null').not().isEmpty(),
check('servings', 'totalAmount must be not null').not().isEmpty(),
check('instructions', 'instructions must be not null').not().isEmpty()
], async function(req,res,next){
  try{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    //Generate uniqe id for recipe
    const id=uniqid();

    db_actions.insertUserRecipe(req.body,id,res,req.session.userId)
  }
  catch(err){
  next(err)
  }
});



//@route GET/api/recipes/random 
//@desc get 3 random preview recipies
//@access Public
router.get('/random', async function(req,res,next){
  try {
      let instructionsEmpty=true;
      while(instructionsEmpty){
      var get_random = await axios.get(`${api_domain}/random`, {
        params: {
          number: 3,
          apiKey: process.env.spooncular_API
        }
      });
      instructionsEmpty = get_random.data.recipes.some((recipe_raw) => recipe_raw==='')
    }
    let randomRecipes = get_random.data.recipes.map((recipe_raw) => recipes_actions.createPreviewRecipe(recipe_raw,'spooncalur'))
    res.status(200).send(randomRecipes);
    } 
    catch (err){
      next(err);
    }
    });


//@route GET/api/recipes/search
//@desc get information about spesific recipe from external API 
//@access Private
router.get("/search", async function(req,res,next) {
  try {
    const { query, cuisine, diet, intolerances, number } = req.query;
    const search_response = await axios.get(`${api_domain}/search`, {
    params: {
        cuisine: cuisine,
        diet: diet,
        intolerances: intolerances,
        query: query,
        number: number,
        instructionsRequired: true,
        apiKey: process.env.spooncular_API
      }
    });
    let recipes = await Promise.all(
    search_response.data.results.map((recipe_raw) =>
    recipes_actions.getRecipeInfo(recipe_raw.id)
    ));

    //if 0 results
    if(recipes.length===0)
      return next(createError(404,'No results found'))
    
      
    //Convert to my pattern
    let convertedRecipes=[];
    recipes.map((recipe) => convertedRecipes.push(recipes_actions.createPreviewRecipe(recipe.data,'spooncalur')));
    res.send(convertedRecipes);
    } 
  catch (err) {
    next(err)
  }
 });
    
//@route GET/api/recipes/:id
//@desc get information about spesific recipe from external API 
//@access Private
router.get('/:id',auth, async function(req,res,next){
  try {
    const get_information= await recipes_actions.getRecipeInfo(req.params.id)
    let reqRecipe =recipes_actions.createRecipe(get_information.data,'SpooncularApi')
    //Save the recipe in user watched history recipes
    await update_watch.updateLastWatchRecipe(req.user,req.params.id,'api',next)
    //Save the recipe in lastWatched recipes
    await update_watch.updateWatchHistoryRecipes(req.user,req.params.id,'api',next)

    res.send(reqRecipe)
    
  } 
  catch (err){
     next(err)
  }
});




module.exports = router;