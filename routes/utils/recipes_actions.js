const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const { poolPromise } = require('../../config/db') 
const createError = require('http-errors') 
const db_actions = require('./db_actions')

function createPreviewRecipe(recipeFromApi,type) {
    let recipe={}
    recipe.id=recipeFromApi.id
    recipe.type=type
    recipe.title=recipeFromApi.title
    recipe.readyInMinutes=recipeFromApi.readyInMinutes
    recipe.aggregateLikes=recipeFromApi.aggregateLikes
    recipe.glutenFree=recipeFromApi.glutenFree
    recipe.vegetarian=recipeFromApi.vegetarian
    recipe.image=recipeFromApi.image
    recipe.summary=recipeFromApi.summary;
    return recipe;
  }


  function createRecipe(recipeFromApi,user) {
    let recipe={}
    recipe.id=recipeFromApi.id
    recipe.username=user
    recipe.title=recipeFromApi.title
    recipe.readyInMinutes=recipeFromApi.readyInMinutes
    recipe.image=recipeFromApi.image
    recipe.aggregateLikes=recipeFromApi.aggregateLikes
    recipe.glutenFree=recipeFromApi.glutenFree
    recipe.vegetarian=recipeFromApi.vegetarian
    recipe.servings=recipeFromApi.servings
    recipe.ingredients=[];
    recipeFromApi.extendedIngredients.map((ingredient) =>{
      let newIngredient = {'name' : ingredient.name , 'unit' : ingredient.unit , 'amount' : ingredient.amount}
      recipe.ingredients.push(newIngredient)
      })
    console.log(recipe.ingredients)
    recipe.instructions=[]
    recipeFromApi.analyzedInstructions[0].steps.map((instruction) =>{
      let newInstruction = {
        'step': instruction.number,
        'instruction': instruction.step
      }
      recipe.instructions.push(newInstruction)
    })   

    recipe.summary=recipeFromApi.summary;
    return recipe;
  }

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



  async function addToFavorite(id,username,type,next,res) {
    try{
      profile = await db_actions.getProfile(username)
      if(!profile)
        return next(createError(404,'profile doesnt exists'))
      if(profile.recordset.length === 0){
        return next(createError(404,'profile doesnt exists'))
      }
      //check if already saved in favorites
      if(profile.recordset[0].favoriteRecipe.length===0)
        favoriteRecipe=[]
      else
        favoriteRecipe=JSON.parse(profile.recordset[0].favoriteRecipe)
          
      let recipeNotExists = favoriteRecipe.some(recId => {
        return recId.id===id
    }) 

    if(!recipeNotExists){
      //Check if the recipe is user or spoon api recipe 
        let newFavorite={'id':id, 'type': type }
        favoriteRecipe.push(newFavorite)
        var pool = await poolPromise  
        await pool.request().query(`update profile set favoriteRecipe = '${JSON.stringify(favoriteRecipe)}' where username =  '${username}'`);
      
    }
      else
      return next(createError(400,'The recipe already exists'))
    
  }
  catch(err){
    next(err)
  }
}

  exports.getRecipeInfo = getRecipeInfo;
  exports.createRecipe = createRecipe
  exports.createPreviewRecipe = createPreviewRecipe;
  exports.addToFavorite = addToFavorite;