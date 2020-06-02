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


//@route GET/api/recipes 
//@desc get all users recipes
//@access Private
router.get('/',auth, async function(req,res,next){
  try {
    pool = await poolPromise  
    result = await pool.request()
    .query(`select * from recipes where username =  '${req.user}'`,async function(err, userecipes){  
      if (err)
        next(err)
      //get Recipes from database
     if(user.recordset.length === 0)
      next(createError('404','User doesnt exists'))
      recipes=userecipes.recordset;
      res.status(200).send({recipes});

    }) 
  }
  catch (err){
    next(err);
  }
  });


//@route GET/api/recipes/userecipe
//@desc get information about spesific recipe from user private recipes
//@access Private
router.get('/userecipe/:id',auth, async function(req,res,next){
  try {
    pool = await poolPromise  
    result = await pool.request()
    .query(`select * from recipes where id=  '${req.params.id}'`,async function(err, recipe){  
      if (err){
       next(err)
      }

      if(recipe.recordset.length === 0)
       next(createError('404','Recipe doesnt exists'))

    recipe=recipe.recordset[0];

    //Save the recipe in user watched history recipes
    update_watch.updateLastWatchRecipe(req.user,req.params.id,next)
    //Save the recipe in lastWatched recipes
    update_watch.updateWatchHistoryRecipes(req.user,req.params.id,next)
    res.status(200).send(recipe)
    })
  } 
    catch (err) {
      next(err);
  }
});


//@route GET/api/recipes/familyrecipe/:id
//@desc get information about family recipe of user private familyrecipes
//@access Private
router.get('/familyrecipe/:id',auth, async function(req,res,next){
  try {
    pool = await poolPromise  
    result = await pool.request()
    .query(`select * from familyrecipes where id=  '${req.params.id}'`,async function(err, recipe){  
        if (err){
          next(err)
        }
        console.log()
        if(recipe.recordset.length === 0)
          next(createError('404','Recipe doesnt exists'))

      recipe=recipe.recordset[0];
      //Save the recipe in user watched history recipes
      update_watch.updateLastWatchRecipe(req.user,req.params.id,next)
      //Save the recipe in lastWatched recipes
      update_watch.updateWatchHistoryRecipes(req.user,req.params.id,next)
      res.status(200).send(recipe)
      })
  } 
  catch (err){
    next(err);
  }
});


//@route GET/api/recipes/familyrecipe
//@desc get all familyrecipes
//@access Private
router.get('/familyrecipe/',auth, async function(req,res,next){
  try {
    pool = await poolPromise  
    result = await pool.request()
    .query(`select * from familyrecipes where username =  '${req.user}'`,async function(err, userecipes){  
      if (err)
        next(err)
      //Get fanilyRecipe from familyrecipe table
      
      if(userecipes.recordset.length === 0)
        next(createError('404','Recipes doesnt exists'))

      recipes=userecipes.recordset;
      res.status(200).send({recipes});
      })
  }
  catch (err) {
    next(err);
  }
});


//@route POST/api/recipes/familyrecipe
//@desc create new familyrecipe ofuser
//@access Private
router.post('/familyrecipe/',auth, [
check('name', 'name must be not empty').not().isEmpty(),
check('image', 'image must be not empty and contain url').not().isEmpty().isURL(),
check('time', 'time must be not empty and integer').not().isEmpty().isInt(),
check('isGluten', 'isGluten must be not empty and boolean').not().isEmpty().isBoolean(),
check('isVegaterian', 'isVegaterian must be not empty and boolean').not().isEmpty().isBoolean(),
check('belongs', 'belongs must contain at leat 1 family member').not().isEmpty(),
check('wichtime', 'wichtime must be not empty').not().isEmpty(),
check('ingredients', 'ingredients must be not null').not().isEmpty(),
check('totalamount', 'totalamount must be not null').not().isEmpty(),
check('instructions', 'instructions must be not null').not().isEmpty()
], async function(req,res,next){
  try{
    const errors = validationResult(req)
    if(!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
      
      //Generate uniqe id for recipe
      const id=uniqid();

      const {
        name,
        image,
        time,
        isGluten,
        isVegaterian,
        ingredients,
        instructions,
        totalamount,
        wichtime,
        belongs,
        generations
      } = req.body

      //Add new recipe to DB
      pool = await poolPromise  
      result = await pool.request()
      .input("id",sql.VarChar(4000), id)
      .input("username",sql.VarChar(10), req.session.userId)
      .input("name",sql.VarChar(4000), name)
      .input("image",sql.VarChar(4000), image)
      .input("time",sql.BigInt, time)
      .input("likes",sql.BigInt,0)
      .input("isGluten", sql.Bit,isGluten==='true' ? 1 : 0)
      .input("isVegaterian", sql.Bit,isVegaterian==='true' ? 1 : 0)
      .input("belongs",sql.VarChar(4000), belongs)
      .input("wichtime",sql.VarChar(4000), wichtime)
      .input("generations",sql.Int,generations)
      .input("ingredients", sql.NVarChar('max'), JSON.stringify(ingredients))
      .input("instructions", sql.NVarChar('max'), JSON.stringify(instructions))
      .input("totalamount", sql.NVarChar('max'), totalamount)
      .execute("insertFamilyRecipe").then(function (recordSet){
      res.status(200).send({message: 'Success', sucess: 'true'})
      })  
  }
  catch (err) {
     next(err);
   }
});

//@route POST/api/recipes 
//@desc create new recipe of user
//@access Private
router.post('/',auth, [
check('name', 'first name must be not empty').not().isEmpty(),
check('image', 'img must be not empty').not().isEmpty(),
check('time', 'time must be not empty and integer').not().isEmpty().isInt(),
check('isGluten', 'time must be not empty and boolean').not().isEmpty().isBoolean(),
check('isVegaterian', 'time must be not empty and boolean').not().isEmpty().isBoolean(),
check('ingredients', 'ingredients must be not null').not().isEmpty(),
check('totalAmount', 'totalAmount must be not null').not().isEmpty(),
check('instructions', 'instructions must be not null').not().isEmpty()
], async function(req,res,next){
  try{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    //Generate uniqe id for recipe
    const id=uniqid();

    const {
      name,
      image,
      time,
      isGluten,
      isVegaterian,
      ingredients,
      instructions,
      totalAmount
    } = req.body

    //Add new recipe to DB
    pool = await poolPromise  
    result = await pool.request()
    .input("id",sql.VarChar(4000), id)
    .input("username",sql.VarChar(10), req.session.userId)
    .input("name",sql.VarChar(4000), name)
    .input("image",sql.VarChar(4000), image)
    .input("time",sql.BigInt, time)
    .input("likes",sql.BigInt,0)
    .input("isGluten", sql.Bit,isGluten==='true' ? 1 : 0)
    .input("isVegaterian", sql.Bit,isVegaterian==='true' ? 1 : 0)
    .input("ingredients", sql.NVarChar('max'), JSON.stringify(ingredients))
    .input("instructions", sql.NVarChar('max'), JSON.stringify(instructions))
    .input("totalAmount", sql.NVarChar('max'), totalAmount)
    .execute("insertRecipe").then(function (recordSet){
      res.status(200).send({message: 'Success', sucess: 'true'})
   })  
  }
  catch(err){
  next(err)
  }
});



//@route GET/api/recipes/random 
//@desc get 3 random preview recipies
//@access Private
router.get('/random',auth, async function(req,res,next){
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
    let randomRecipes = get_random.data.recipes.map((recipe_raw) => recipes_actions.createPreviewRecipe(recipe_raw))
    res.status(200).send({randomRecipes});
    } 
    catch (err){
      next(err);
    }
    });


//@route GET/api/recipes/search
//@desc get information about spesific recipe from external API 
//@access Private
router.get("/search", auth, async function(req,res,next) {
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
    recipes.map((recipe) => convertedRecipes.push(recipes_actions.createPreviewRecipe(recipe.data)));
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
    update_watch.updateLastWatchRecipe(req.user,req.params.id,next)
    //Save the recipe in lastWatched recipes
    update_watch.updateWatchHistoryRecipes(req.user,req.params.id,next)

    res.send(reqRecipe)
    
  } 
  catch (err){
     next(err)
  }
});


module.exports = router;