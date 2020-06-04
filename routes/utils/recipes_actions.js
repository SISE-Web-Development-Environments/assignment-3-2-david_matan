const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const { poolPromise } = require('../../config/db') 
const createError = require('http-errors') 

function createPreviewRecipe(recipeFromApi) {
    let recipe={}
    recipe.id=recipeFromApi.id
    recipe.name=recipeFromApi.title
    recipe.time=recipeFromApi.readyInMinutes
    recipe.likes=recipeFromApi.aggregateLikes
    recipe.isGluten=recipeFromApi.glutenFree
    recipe.isVegaterian=recipeFromApi.vegetarian
    recipe.image=recipeFromApi.image
    return recipe;
  }


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

    var favoriteRecipe;
    pool = await poolPromise  
    result2 = await pool.request()
    .query(`select * from profile where username =  '${username}'`,async function(err, profile){  
       if (err){
          next(err)
       }

       if(profile.recordset.length === 0){
       next(createError('404','profile doesnt exists'))
       }
 
       //check if already saved in favorites
       if(profile.recordset[0].favoriteRecipe.length===0)
          favoriteRecipe=[]
       else
          favoriteRecipe=JSON.parse(profile.recordset[0].favoriteRecipe)
          
       recipeNotExists = favoriteRecipe.some(recId => {
        return recId.id===id
    }) 

    if(!recipeNotExists){
       //Check if the recipe is user or spoon api recipe 
          let newFavorite={'id':id, 'type': type }
          favoriteRecipe.push(newFavorite)
          await pool.request()
          .query(`update profile set favoriteRecipe = '${JSON.stringify(favoriteRecipe)}' where username =  '${username}'`,function(err, user){
             return res.status(200).json({message: 'Favorite recipe succesfuly added', sucess:'true'})
          })
       }
       else
       next(createError(400,'The recipe already exists'))
    })
  }
  catch(err){
    next(err)
  }
}

  exports.getRecipeInfo = getRecipeInfo;
  exports.createRecipe = createRecipe
  exports.createPreviewRecipe = createPreviewRecipe;
  exports.addToFavorite = addToFavorite;