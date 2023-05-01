const User = require("../models/User")
const postModel = require('../models/Posts')
const reportModel = require('../models/Report')

let credential = {
  email: "admin@gmail.com",
  password: 123
}

//......adminLogin
module.exports = {
  adminLogin: (req, res) => {
    const { email, password } = req.body

    try {
      if (email == credential.email && password == credential.password) {
        res.status(200).json('adminLogged')

      } else {
        res.status(400).json("Invalid login details")
      }
    } catch (err) {
      console.log(err);
    }
  },

  //......................................getAllusers
  getAllUsers: async (req, res) => {
    try {
      const allUsers = await User.find()
      res.status(200).json(allUsers)
    } catch (err) {
      res.status(400).json(err)
    }

  },
  //................................................updateUserStatus
  updateUserStatus: async (req, res) => {
    console.log('reachedddd');
    console.log(req.query);

    try {
      const updateStatus = await User.updateOne({ _id: req.query.userId }, { $set: { status: req.query.status } })
      res.status(200).json(updateStatus)
    } catch (err) {
      console.log(err);
      res.status(400).json(err)
    }

  },
  //...............................................getPosts
  getPosts: async (req, res) => {
    console.log(req.params.state);
    try {
      if (req.params.state == 'daily') {
        const daily = await postModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // get posts from last 7 days
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%m-%d",
                  date: "$createdAt"
                }
              },
              post_count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ])

        res.status(200).json(daily)
      }

     if(req.params.state == 'monthly') {
      const monthly=await postModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // get posts from last 365 days
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt"
              }
            },
            post_count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
      res.status(200).json(monthly)
     }



    }catch(err){
      res.status(500).json(err)
    }
  },

  //.......................................getUsers
  getUsers:async(req, res) =>{
    console.log('reachedd');
    try {
      if (req.params.state == 'daily') {
        const daily = await User.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // get posts from last 7 days
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%m-%d",
                  date: "$createdAt"
                }
              },
              user_count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ])

        res.status(200).json(daily)
      }

     if(req.params.state == 'monthly') {
      const monthly=await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // get posts from last 365 days
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt"
              }
            },
            user_count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
      res.status(200).json(monthly)
     }



    }catch(err){
      res.status(500).json(err)
    }
  },
  //.....................................................getReports
  getReports: async (req, res) => {
    let data = [];
  
    try {
      const result = await reportModel.find();
  
      await Promise.all(
        result.map(async (item) => {
          console.log(item, 'item');
  
          const response = await postModel
            .findById(item.postId)
            .populate({ path: 'userId', select: 'username' });
  
          data.push({response,problem:item.problem});
        })
      );
  
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //.....................................................controlPost
  controlPost:async(req,res) => {
    const{postId, status} = req.query
    try{
     const result = await postModel.findByIdAndUpdate(postId,{$set:{status:status}})
      const updateReport = await reportModel.findOneAndUpdate({postId},{$set:{status}})
      res.status(200).json('updated')
    }catch(err){
      res.status(500).json(err)
    }
  }
  
  
  
}