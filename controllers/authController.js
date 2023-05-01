const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const User = require('../models/User')



module.exports={
    //..............................................userRegister
     userRegigster:async(req,res)=>{
        try {
          const user=await User.findOne({$or:[{username:req.body.name},{ email:req.body.email }]}) 
          console.log("user");
          console.log(user);
          if(user){
            if(user.username==req.body.name){
             res.json({name:true})
            }else if(user.email==req.body.email){
              res.json({email:true})
            }
          }else {
            // generate new Password
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            // create new user
            const newUser = new User({
              username: req.body.name,
              password: hashedPassword,
              email: req.body.email,
              number: req.body.number,
              field: req.body.field,
              banner:'https://www.mub.eps.manchester.ac.uk/graphene/wp-content/themes/uom-theme/assets/images/default-banner.jpg'
            })
           const user= await newUser.save()
             res.json({user:true})
          }   
        }catch (err) {
          res.status(500).json(err)
        }            
      },
//.....................................................userLogin
    userLogin: async (req, res) => {
      console.log('loginreached');
        try {
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                return res.json({ UsernotFound: true })
            }
            if(user.status){
             return res.json({userBlocked:true})
            }
            // validate password
            const validPassword = await bcrypt.compare(req.body.password, user.password)
            if (!validPassword) {
                return res.json({ passwordNotMatch: true })
            }
         
            const {password,followings,followers,isAdmin,number,...otherDetails}=user._doc
            const accessToken = jwt.sign(
                { "userDetails":  otherDetails},
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1d' }
            )
            // const refreshToken = jwt.sign(
            //     { "userDetails": otherDetails},
            //     process.env.REFRESH_TOKEN_SECRET,
            //     { expiresIn: '1d' }
            // )
            // user.refreshToken = refreshToken
            // user.save()
            // res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
              res.cookie('jwt',accessToken)
            return res.json({ message: 'userLogged', loggedIn: true })
        } catch (err) {
            console.log(err);
            res.status(500).json(err)
        }
    },

    handleLogout: async(req, res) => {
      try {
          const cookie=req.cookies
          if(!cookie?.jwt) return res.send('clear jwt')
          const refreshToken = cookie.jwt
          const user = await User.findOne({ refreshToken })
          console.log(user,'user');
          if (!user) {
              res.clearCookie('jwt',{ httpOnly: true , maxAge: 24 * 60 * 60 * 1000 })
              res.json({ removeCookie: true })
          } else {
             User.findOneAndUpdate({refreshToken},{refreshToken:''},{new:true}).then(updatedUser=> {
              res.json({updatedUser})
             })
             res.clearCookie('jwt',{ httpOnly: true , maxAge: 24 * 60 * 60 * 1000 })
          }
          
      } catch (err) {
          console.log(err);
          res.status(500).json(err)
      }
  },
}