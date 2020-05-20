const express = require('express');
const router=express.Router();
const { poolPromise } = require('../../config/db')  
const uniqid = require('uniqid');
const sql = require('mssql')  
const {check, validationResult} = require('express-validator')
const auth = require('../../middlewares/auth');
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

//@route GET/api/profiles/:id
//@desc get information about spesific recipe from external API 
//@access Private
router.get('/myprofile',auth, async function(req,res){
    try{
        var pool = await poolPromise  
        var result = await pool.request()
       .query(`select * from recipes where username = '${req.user}' `,function(err, recipes){  
           if (err)
           console.log(err) 

           else {  
           let userProfile = recipes.recordset; 
           return res.status(200).json(userProfile) 
           }  
       })
    }
 catch(error)
 {
    console.log(err.message)
    res.status(500).send('Server error');
 }
})

//@route POST/api/profiles
//@create new profile of user
//@access Private
router.post('/',auth, async function(req,res){
    try{
        pool = await poolPromise  
        result = await pool.request()
       .input("username",sql.VarChar(10), req.user)
       .input("watchedRecipe",sql.VarChar('max'),[])
       .input("favoriteRecipe",sql.VarChar(4000), [])
       .input("familyRecipe",sql.VarChar(4000), [])
       .input("lastWatched",sql.VarChar(4000), [])
       .execute("insertProfile").then(function (recordSet){
        res.send({msg: 'New profile created'})
       })  
    }
 catch(error)
 {
    console.log(error.message)
    res.status(500).send('Server error');
 }
})

module.exports = router;