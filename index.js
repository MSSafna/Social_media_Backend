const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')

const userRoute = require('./routes/Users/users')
const userPost = require('./routes/Users/posts')
const userConveration=require('./routes/Users/conversation')
const userMessage=require('./routes/Users/message')
const  adminRoute = require ('./routes/Admin/admin')
 

const bodyParser = require("body-parser");
var cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config();
mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true,useUnifiedTopology:true}, () => {
  console.log('connected to mongo')
})


// middleware
app.use(cookieParser())
app.use(express.json())
app.use(helmet())

app.use(morgan('common'))
app.use(cors({
  origin:["http://localhost:3000"],
  method:["GET","POST"],
  credentials:true
}))

app.use('/api/user', userRoute)
app.use('/api/posts', userPost)
app.use('/api/conversation', userConveration)
app.use('/api/message',userMessage)
app.use('/api/admin',adminRoute)

app.listen(4000, () => {
  console.log('connected to server')
})
