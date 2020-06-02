const express = require('express');
const connectDB = require('./config/db')
const sessions = require("client-sessions")
var bodyParser = require('body-parser')

const app=express();

//Init Middleware
app.use(bodyParser.json({extended: false}))

app.use(bodyParser.json());

//Init Cookie
app.use(sessions({
  cookieName: 'session', 
  secret: process.env.COOCKIE_SECRET, 
  ephemeral:true,
  duration: 2 * 60 * 60 * 1000
}));
 
//Check server Running
app.get('/', (req,res) =>res.send('API Runnig'))

//Define routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/recipes', require('./routes/api/recipes'))
app.use('/api/profiles', require('./routes/api/profiles'))

//Catch all
app.use(function (err, req, res, next) {
  console.error(err.status);
  return res.status(err.status || 500).send({ message: err.message, success: false });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT , () => console.log(`Sever started on port ${PORT}`));