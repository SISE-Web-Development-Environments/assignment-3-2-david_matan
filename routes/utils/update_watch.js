
const { poolPromise } = require('../../config/db')  
const createError = require('http-errors')
const db_actions = require('./db_actions')

async function updateWatchHistoryRecipes(username,recipeid,type,next)
  {

    try{
    let userHistory=[];
    let recipeNotWatched;
    var pool = await poolPromise  
    let result = await db_actions.getProfile(username,next);
    if(result.recordset.length === 0)
        next(createError('404','username doesnt exists'))

    let user=result.recordset[0];

    if(user.watchedRecipe.length===0)
      userHistory=[]
    else
      userHistory=JSON.parse(user.watchedRecipe)

    //check if already saved in history , continue
    recipeNotWatched = userHistory.some(recipe => recipe.id===recipeid) 

    if(!recipeNotWatched){
      let newId={'id': recipeid , 'type': type}
      userHistory.push(newId)
      await pool.request().query(`update profile set watchedRecipe = '${JSON.stringify(userHistory)}' where username =  '${username}'`);
      return;
  }
}
catch(err){
  next(err)
}

}

//Update user recipe last watch
async function updateLastWatchRecipe(username,recipeid,type,next)
{
  try{
  var pool = await poolPromise  
  var userLastWatched=[];
  let result = await db_actions.getProfile(username,next);
  if(result.recordset.length === 0)
      next(createError('404','username doesnt exists'))
  
  let user=result.recordset[0];
  
  if(user.watchedRecipe.length===0)
      userLastWatched=[]
  else
    userLastWatched=JSON.parse(user.lastWatched)
    
  // if recipe is already in last 3 so continue
  recipeNotWatched = userLastWatched.some(recipe => recipe.id===recipeid)  

  if(!recipeNotWatched){
    let newId={'id': recipeid , 'type' : type}
    userLastWatched.push(newId)

    //if 4 recipes saved so delelte the old one
    if(userLastWatched.length==4) 
      userLastWatched.shift()
    await pool.request().query(`update profile set lastWatched = '${JSON.stringify(userLastWatched)}' where username =  '${username}'`);
    return;
  }
  else
    return
  }
    catch(err){
      next(err)
    }
    
  }

exports.updateWatchHistoryRecipes = updateWatchHistoryRecipes;
exports.updateLastWatchRecipe = updateLastWatchRecipe;