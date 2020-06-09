
const { poolPromise } = require('../../config/db')  
const sql = require('mssql')  
const createError = require('http-errors')

async function insertUser(userDetails,cryptpassword,next)
{
     const {username,firstname,lastname,email,url,country} = userDetails;

     //Check if user exists
      try{
      var pool = await poolPromise  
      var result = await pool.request().query('select * from users')

      if(!result.recordset.length==0)
      {

      let data = result.recordset;
      let usernameInUse = data.some(user => {return user.username===username})

      //UserName taken
      if(usernameInUse)
        return next(createError(404,'User already exists'))
      
      //Email taken
      emailInUse = data.some((user) => {return user.email===email})
      if(emailInUse)
        return next(createError(404,'Email already exists'))
      }
      await pool.request()
        .input("username",sql.VarChar(10), username)
        .input("firstname",sql.VarChar(4000), firstname)
        .input("lastname",sql.VarChar(4000), lastname)
        .input("country",sql.VarChar(50), country)
        .input("password",sql.VarChar('max'),cryptpassword)
        .input("email", sql.VarChar('4000'),email)
        .input("url", sql.VarChar('max'),url)
        .execute("insertUser");
      }

    catch(err){
     next(err)
    }
}

async function insertProfile(req,username,next)
{
    try{
    //find the user
    console.log(username)
    var pool = await poolPromise  
    var result = await pool.request().query(`select * from users where username='${username}'`);
    let data = result.recordset;
    if(data.length==0)
      return next(createError(404,'User doesnt exists'))
    //create for user profile
    await pool.request()
    .input("username",sql.VarChar(10), username)
    .input("watchedRecipe",sql.VarChar('max'),[])
    .input("favoriteRecipe",sql.VarChar(4000), [])
    .input("familyRecipe",sql.VarChar(4000), [])
    .input("lastWatched",sql.VarChar(4000), [])
    .execute("insertProfile")
    
    }
    catch(err){
      next(err)
    }
}


async function insertNewFamilyRecipe(recipeDetails,id,res,username)
{
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
      } = recipeDetails

      //Add new recipe to DB
      pool = await poolPromise  
      result = await pool.request()
      .input("id",sql.VarChar(4000), id)
      .input("username",sql.VarChar(10), username)
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


async function insertUserRecipe(recipeDetails,id,res,username)
{
    const {
        name,
        image,
        time,
        isGluten,
        isVegaterian,
        ingredients,
        instructions,
        totalAmount
      } = recipeDetails
  
      //Add new recipe to DB
      pool = await poolPromise  
      result = await pool.request()
      .input("id",sql.VarChar(4000), id)
      .input("username",sql.VarChar(10), username)
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

async function getFamilyRecipe(username,next)
{
  try{
    pool = await poolPromise  
    console.log(username)
    result = await pool.request().query(`select * from familyrecipes where username =  '${username}'`)
    if(result.recordset.length==0){
      next(createError(404,'Recipes doesnt exists'))
    }
    return result.recordset;
}
  catch(err) {
    next(err)
  }  
}


async function getUserRecipes(username,next)
{
  try{
    pool = await poolPromise  
    console.log(username)
    result = await pool.request().query(`select * from recipes where username =  '${username}'`)
    if(result.recordset.length==0){
      next(createError(404,'Recipes doesnt exists'))
    }
    return result.recordset;
}
  catch(err) {
    next(err)
  }  
}

async function getUserSpesificRecipe(id,next)
{
  try{
    pool = await poolPromise  
    result = await pool.request().query(`select * from recipes where id =  '${id}'`)
    return result;
  }
  catch(err) {
    next(err)
  }  
}

async function getUserFamilySpesificRecipe(id,next)
{
  try{
    pool = await poolPromise  
    result = await pool.request().query(`select * from familyrecipes where id =  '${id}'`)
    if(result.recordset.length==0)
      return next(createError(404,'Recipe doesnt exists'))
    return result
  }
  catch(err) {
    next(err)
  }  
}

async function getUser(username,next)
{
  try{
    var pool = await poolPromise  
    var result = await pool.request().query(`select * from users where username = '${username}'`)
    return result;
  }
  catch(err){
    next(err)
 }
}

async function getProfile(username,next)
{
  try{
    var pool = await poolPromise  
    var result = await pool.request().query(`select * from profile where username = '${username}'`)
    return result;
  }
  catch(err){
    next(err)
 }
}

exports.getProfile=getProfile;
exports.getUser=getUser;
exports.getUserFamilySpesificRecipe=getUserFamilySpesificRecipe;
exports.getUserSpesificRecipe=getUserSpesificRecipe;
exports.getUserRecipes=getUserRecipes;
exports.getFamilyRecipe=getFamilyRecipe;
exports.insertUser = insertUser;
exports.insertProfile = insertProfile;
exports.insertNewFamilyRecipe = insertNewFamilyRecipe;
exports.insertUserRecipe = insertUserRecipe;