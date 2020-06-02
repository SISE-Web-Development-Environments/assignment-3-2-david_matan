
const { poolPromise } = require('../../config/db')  
const createError = require('http-errors')
const sql = require('mssql')  
async function updateWatchHistoryRecipes(username,recipeid,next)
  {
    var userHistory=[];
    var recipeNotWatched;
    try{
    var pool = await poolPromise  
    var result = await pool.request()
    .query(`select * from profile where username =  '${username}'`,async function(err, user){  
    if (err)
        next(err)

    if(user.recordset.length === 0)
        next(createError('404','username doesnt exists'))
    if(user.recordset[0].watchedRecipe.length===0)
      userHistory=[]
    else
      userHistory=JSON.parse(user.recordset[0].watchedRecipe)


    recipeNotWatched = userHistory.some(recipe => recipe.id===recipeid) //check if already saved in history , continue

    if(!recipeNotWatched){
      let newId={'id': recipeid}
      userHistory.push(newId)
      await pool.request()
    .query(`update profile set watchedRecipe = '${JSON.stringify(userHistory)}' where username =  '${username}'`,function(err, user){
    })
    }
  })
}
catch(err){
  return err
}

}

//Update user recipe last watch
async function updateLastWatchRecipe(username,recipeid,next)
{
  try{
  var userLastWatched=[];
  var pool = await poolPromise  
  var result = await pool.request()
  .query(`select * from profile where username =  '${username}'`,async function(err, user){  
  if (err)
    next(err)
  
  if(user.recordset.length === 0)
    next(createError('404','username doesnt exists'))
  
    if(user.recordset[0].watchedRecipe.length===0)
      userLastWatched=[]
    else
    userLastWatched=JSON.parse(user.recordset[0].lastWatched)

  recipeNotWatched = userLastWatched.some(recipe => recipe.id===recipeid)  // if recipe is already in last 3 so continue


  if(!recipeNotWatched){
    let newId={'id': recipeid}
    userLastWatched.push(newId)

      //if 4 recipes saved so delelte the old one
    if(userLastWatched.length==4) 
      userLastWatched.shift()
  
    await pool.request()
     .query(`update profile set lastWatched = '${JSON.stringify(userLastWatched)}' where username =  '${username}'`,function(err, user){
      })
      }})
    }
    catch(err){
      next(err)
    }
    
  }

exports.updateWatchHistoryRecipes = updateWatchHistoryRecipes;
exports.updateLastWatchRecipe = updateLastWatchRecipe;