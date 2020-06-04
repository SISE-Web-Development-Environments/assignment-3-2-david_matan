
const { poolPromise } = require('../../config/db')  
const sql = require('mssql')  
const createError = require('http-errors')

async function registerNewUser(userDetails,cryptpassword,next,res)
{
try{
     const {username,firstname,lastname,email,url,country} = userDetails;
     //Check if user exists
     var pool = await poolPromise  
     var result = await pool.request()
     .query('select * from users',async function(err, users){ 
       if (err)   
         return next(err)
      
       let data = users.recordset;  
       let usernameInUse = data.some(user => {return user.username===username})

         //UserName taken
        if(usernameInUse)
            return next(createError(404,'User already exists'))
         
         //Email taken
         emailInUse = data.some((user) => {return user.email===email})
         if(emailInUse)
             return next(createError(404,'Email already exists'))
          
         await pool.request()
          .input("username",sql.VarChar(10), username)
          .input("firstname",sql.VarChar(4000), firstname)
          .input("lastname",sql.VarChar(4000), lastname)
          .input("country",sql.VarChar(50), country)
          .input("password",sql.VarChar('max'),cryptpassword)
          .input("email", sql.VarChar('4000'),email)
          .input("url", sql.VarChar('max'),url)
          .execute("insertUser").then(async function (recordSet){
              await pool.request()
             .input("username",sql.VarChar(10), username)
             .input("watchedRecipe",sql.VarChar('max'),[])
             .input("favoriteRecipe",sql.VarChar(4000), [])
             .input("familyRecipe",sql.VarChar(4000), [])
             .input("lastWatched",sql.VarChar(4000), [])
             .execute("insertProfile").then(function (recordSet){    
                 return res.status(200).json({msg: 'New User and profile creatred', success : 'true'})
             })  
         })
    })
    }
    catch(err)
    {
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


exports.registerNewUser = registerNewUser;
exports.insertNewFamilyRecipe = insertNewFamilyRecipe;
exports.insertUserRecipe = insertUserRecipe;