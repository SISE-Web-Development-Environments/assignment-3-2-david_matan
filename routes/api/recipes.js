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
    recipe=JSON.parse(recipe.recordset[0]);
    //Save the recipe in user watched history recipes
    updateLastWatchRecipe(req.user,req.params.id)
    //Save the recipe in lastWatched recipes
    updateWatchHistoryRecipes(req.user,req.params.id)
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
      recipe=JSON.parse(recipe.recordset[0]);
      //Save the recipe in user watched history recipes
      updateLastWatchRecipe(req.user,req.params.id)
      //Save the recipe in lastWatched recipes
      updateWatchHistoryRecipes(req.user,req.params.id)
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
check('totalamount', 'totalAmount must be not null').not().isEmpty(),
check('instructions', 'instructions must be not null').not().isEmpty()
], async function(req,res,next){
  try{
    const errors = validationResult(req)
    if(!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
      
      //Generate uniqe id for recipe
      const id=uniqid();

      const {name,image,time,isGluten,isVegaterian,ingredients,instructions,totalamount,wichtime,belongs} = req.body

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
      .input("ingredients", sql.NVarChar('max'), JSON.stringify(ingredients))
      .input("instructions", sql.NVarChar('max'), JSON.stringify(instructions))
      .input("totalamount", sql.NVarChar('max'), totalamount)
      .execute("insertRecipe").then(function (recordSet){
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

    const {name,image,time,isGluten,isVegaterian,ingredients,instructions,totalAmount} = req.body

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
//@desc get 3 random recipies
//@access Private
router.get('/random',auth, async function(req,res,next){
  try {
    const get_random = await axios.get(`${api_domain}/random`, {
      params: {
        number: 3,
        apiKey: process.env.spooncular_API
      }
    });
    
    let randomRecipes = get_random.data.recipes.map((recipe_raw) => createRecipe(recipe_raw,req.user))
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
        getRecipeInfo(recipe_raw.id)
    ));

    //if 0 results
    if(recipes.length===0)
      next(createError(404,'No results found'))
    
    //Convert to my pattern
    let convertedRecipes=[];
    recipes.map((recipe) => convertedRecipes.push(createRecipe(recipe.data)));
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
    const get_information= await getRecipeInfo(req.params.id)
    let reqRecipe = createRecipe(get_information.data,req.user)
   
    //Save the recipe in user watched history recipes
    updateLastWatchRecipe(req.user,req.params.id)
    //Save the recipe in lastWatched recipes
    updateWatchHistoryRecipes(req.user,req.params.id)

    res.send(reqRecipe)
    
  } 
  catch (err){
     next(err)
  }
});



  //Get information of spesific reice
  //@ id - id of recipe
function getRecipeInfo(id) {
  return axios.get(`${api_domain}/${id}/information`, {
    params: {
    includeNutrition: false,
    apiKey: process.env.spooncular_API
    }
  });
}
    
//Create recipe function 
//@Takes recipe from api and convert to same format as user
function createRecipe(recipeFromApi,user) {
  let recipe={}
  recipe.id=recipeFromApi.id
  recipe.username=user
  recipe.name=recipeFromApi.title
  recipe.time=recipeFromApi.readyInMinutes
  recipe.image=recipeFromApi.image
  recipe.likes=recipeFromApi.aggregateLikes
  recipe.isGluten=recipeFromApi.glutenFree
  recipe.isVegaterian=recipeFromApi.vegetarian
  recipe.totalamount=recipeFromApi.servings
  recipe.ingredients=[]
  recipe.ingredients.push(recipeFromApi.extendedIngredients.map((ingredient) =>{
    return{
      name: ingredient.name,
      amount: ingredient.amount
    }}
  ));
  
  recipe.instructions=[]
  recipe.instructions.push(recipeFromApi.analyzedInstructions[0].steps.map((instruction) =>{
    return {
      step: instruction.number,
      instruction: instruction.step
    }   
  }))
  return recipe;
}
    


//Update user recipe profile history 
async function updateWatchHistoryRecipes(username,recipeid)
  {
    var userHistory=[];
    var recipeNotWatched;
    var pool = await poolPromise  
    var result = await pool.request()
    .query(`select * from profile where username =  '${username}'`,async function(err, user){  
      if (err){
        next(err)
    }

    userHistory=JSON.parse("["+user.recordset[0].watchedRecipe+"]");
    recipeNotWatched = userHistory.some(id => {return (id.toString()===recipeid.toString())}) //check if already saved in history , continue
  
    if(!recipeNotWatched){
      userHistory.push(recipeid)
      await pool.request()
    .query(`update profile set watchedRecipe = '${userHistory}' where username =  '${username}'`,function(err, user){
    })
    }
  })
}

//Update user recipe last watch
async function updateLastWatchRecipe(username,recipeid)
{
  var userLastWatched=[];
  var pool = await poolPromise  
  var result = await pool.request()
  .query(`select * from profile where username =  '${username}'`,async function(err, user){  
  if (err){
  console.log(err.message)
  }

  userLastWatched=JSON.parse("["+user.recordset[0].lastWatched+"]");
  recipeNotWatched = userLastWatched.some(id => {return (id.toString()===recipeid.toString())})  // if recipe is already in last 3 so continue


  if(!recipeNotWatched){
    userLastWatched.push(recipeid)

      //if 4 recipes saved so delelte the old one
      if(userLastWatched.length==4) 
          userLastWatched.shift()
  
    await pool.request()
     .query(`update profile set lastWatched = '${userLastWatched}' where username =  '${username}'`,function(err, user){
      })
      }})
  }




module.exports = router;