const User = require('../models/User')
const Posts = require('../models/Posts')
const Comment = require('../models/Comment')
const Report = require('../models/Report')
const Notification = require('../models/Notification')
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt')
const ReplayComment = require('../models/ReplayComment');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'do4my2sxk',
  api_key: '737763838648535',
  api_secret: '9eVoUyJjMQ05m0XGtsUYH99691Y',
  colors: true,
});



module.exports = {
  //.......................................................................getPost.......................
  getPosts: async (req, res) => {
    try {
      const currentUser = await User.findById(req.params.userId)
      const userPosts = await Posts.find({ userId: currentUser._id }).sort({ _id: - 1 }).populate('userId')
      const friendPosts = await Promise.all(
        currentUser.followings.map((friendId) => {
          return Posts.find({ userId: friendId, status: { $ne: true } })
          .sort({ _id: -1 })
          .populate('userId');
        
        })
      )
      let result = userPosts.concat(...friendPosts).sort((a, b) => b.createdAt - a.createdAt)
      res.json({ result })
    } catch (err) {
      console.log(err);
      res.status(500).json(err)
    }
  },

  //....................................................................postPost....................
  postPost: async (req, res) => {
    const { message, userId } = req.body;
    const user = await User.findById(userId)
    let imageUrl=[]
    try {
      if (req.files) {
       
        // const file = req.files;
        // console.log(file,'fileee');
        for(value of req.files){
         let file = value.path
           let url = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(file, (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result.url);
              }
            });
          });
          imageUrl.push(url)
        }
        console.log(imageUrl,'imageurl...');
        var data = {
          userId: userId,
          caption: message,
          imageName: imageUrl,
        };
      } else {
        var data = {
          userId: userId,
          caption: message
        }
      }
       user.followers.map((userId) => {
        const newNotification = new Notification({
          receiverId:userId,
          senderName:user.username,
          message:'added a post'
        })
        newNotification.save()
       })
     

      
      const newPost = new Posts(data);
      const savedPost = await newPost.save();
      const post = await Posts.findOne({ _id: savedPost._id }).populate('userId');
      res.status(200).json(post);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },


  //............................................getSearchUser....................................
  getSearchUser: async (req, res) => {
    const { value } = req.query
    console.log(req.query.userId, 'req.body.userId');
    console.log(value);
    const regex = new RegExp(value, 'i');
    if (regex.test('')) {
      res.json([])
    } else {
      const users = await User.find({
        $and: [
          { _id: { $ne: req.query.userId } },
          { username: { $regex: regex } }
        ]
      });

      if (users.length == 0) {
        res.json({ userNotFound: true })
      } else {
        res.json(users)
      }

    }

  },

  //....................................................postComment....................................
  postComment: async (req, res) => {
    const data = {
      userId: req.body.userId,
      postId: req.params.id,
      comment: req.body.comment,
    }
    console.log(data,'data');
    const newComment = new Comment(data);
    try {
      const savedComment = await newComment.save()
      const Post = await Posts.findById(req.params.id).updateOne({ $push: { comments: savedComment._id } })
      const comment = await Comment.findOne({ _id: savedComment._id }).populate('userId').sort('-createdAt')
      res.status(200).json(comment)
    } catch (error) {
      console.log(error);
    }
  },

  //.............................................................getComment....................................
  getComment: async (req, res) => {
    try {
      const comment = await Comment.find({ postId: req.params.id, parentcomment: { $exists: false } }).populate('userId').sort('-createdAt')
      res.status(200).json(comment)
    } catch (error) {
      console.log(error, 'error');
    }
  },

  //...................................................getReplycomment...........................

  getReply: async (req, res) => {
    try {
      const replayComment = await Comment.find({ parentcomment: req.params.id }).populate('userId').sort('-createdAt')
      res.json(replayComment)
    } catch (error) {
      console.log(error);
    }
  },
  //...................................................................postReplyComment........................
  replayComment: async (req, res) => {
    try {
      const data = {
        userId: req.body.userId,
        postId: req.body.postId,
        parentcomment: req.params.id,
        comment: req.body.comment

      }

      const replayComment = new Comment(data);
      const savedReplyComment = await replayComment.save()
      const testing = await Comment.findOneAndUpdate({ _id: data.parentcomment }, { $push: { replayComment: savedReplyComment._id } })
      console.log(testing, '');
      const newComment = await Comment.findOne({ _id: savedReplyComment._id }).populate('userId').sort('-createdAt')
      res.json(newComment)
    } catch (error) {
      res.status(500).json(error)
    }

  },

  //...........................................................deletePost...................................
  deletePost: async (req, res) => {
    try {
      console.log(req.params);
      let imageUrl
      const deleteComment = await Comment.deleteMany({ postId: req.params.id })
      const post = await Posts.findOne({ _id: req.params.id })
      // if(post.imageName.length>0){
      //    imageUrl =[...post.imageName] 
      //    console.log(imageUrl,'imageUrl');
      //    imageUrl.map((url) => {
      //      const urlArray = imageUrl.split('/');
      //      console.log(urlArray,'urlArray');
      //    })
      //   const image = urlArray[urlArray.length - 1]
      //   const imageName = image.split('.')[0]
      //   const response = await cloudinary.uploader.destroy(imageName, { invalidate: true, resource_type: "image" },)
      // }
      const deletePost = await Posts.deleteOne({ _id: req.params.id })
      res.json('succcessfully deleted')
    } catch (err) {
      console.log(err);
    }
  },

  //.................................................................getUserPosts..............................
  userPosts: async (req, res) => {
    const userPost = await Posts.find({ userId: req.params.id }).sort({ _id: - 1 }).populate('userId')
    const userDetails = await User.findById({ _id: req.params.id })
    res.json({ userPost, userDetails })


  },
  //.................................................................updateProfile.................
  updateProfile: async (req, res) => {
    console.log(req.body);
    const { username, userId, password, email, number, bio } = req.body;
    var data = {}
    try {
      if (password) {
        var hashedPassword = await bcrypt.hash(password, 10)
      }

      username.trim() != "" ? data.username = username : '';
      number != "" ? data.number = number : '';
      password != "" ? data.password = hashedPassword : '';
      email.trim() != "" ? data.email = email : '';
      bio.trim() != "" ? data.bio = bio : '';

      console.log(data, 'dataa');
      const updateUser = await User.updateOne({ _id: userId }, { $set: data })
      res.status(200).json({ updated: true })
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  //....................................................................deleteProfile............................
  deleteProfile: async (req, res) => {
     const user=await User.findById({_id:req.params.id})
    const imageUrl = user.profilePicture
      const urlArray = imageUrl.split('/');
      const image = urlArray[urlArray.length - 1]
      const imageName = image.split('.')[0]
      const response = await cloudinary.uploader.destroy(imageName, { invalidate: true, resource_type: "image" },)
    const result = await User.updateOne({ _id: req.params.id }, { profilePicture: "" })
    res.status(200).json({ profileDeleted: true })
  },

  //........................................................updateprofileimage..................................
  updateprofileimage: async (req, res) => {
    console.log('reacheddd');
    const file = req.file.path;
    const imageUrl = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.url);
        }
      });
    });
    const updateUser = await User.updateOne({ _id: req.body.userId }, { $set: { profilePicture: imageUrl } })
    res.status(200).json(updateUser)

  },

  //.........................................................bannerUpdate
  bannerUpdate: async (req, res) => {
    const file = req.file.path;
    const imageUrl = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.url);
        }
      });
    });
    const updateProfile = await User.updateOne({ _id: req.body.userId }, { $set: { banner: imageUrl } });
    res.status(200).json(updateProfile)
  },
  //................................................................removeBanner
  removeBanner: async (req, res) => {
    try {
      const user=await User.findById({_id:req.params.id})
      const imageUrl = user.banner
        const urlArray = imageUrl.split('/');
        const image = urlArray[urlArray.length - 1]
        const imageName = image.split('.')[0]
        const response = await cloudinary.uploader.destroy(imageName, { invalidate: true, resource_type: "image" },)
      const result = await User.updateOne({ _id: req.params.id }, { $set: { banner: 'https://www.mub.eps.manchester.ac.uk/graphene/wp-content/themes/uom-theme/assets/images/default-banner.jpg' } })
      res.json(result)
    } catch (err) {
      res.json(err)
    }
  },

  //...........................................................................getUserDetails
  getUserDetails: async (req, res) => {
    console.log('reached');
    try {
      const result = await User.findById({ _id: req.params.id })
      res.status(200).json(result)
       
    } catch (err) {
      console.log(err);
    }
  },


  //..............................getFollowers andFollowinssetils
  getFriendDetails:async(req, res) => {
    try {
      const result = await User.findById({ _id: req.params.userId })
       const followersDetails =await Promise.all(result.followers.map((userId)=>{
              return User.findById(userId)  
       }))

      let followersFriendList=[]
       followersDetails.map((friend) => {
         const{_id, username, profilePicture } = friend
         followersFriendList.push({_id, username, profilePicture})
       })
            const followingDetails =await Promise.all(result.followings.map((userId)=>{
           return  User.findById(userId)
    
         }))

      let followingsFriendList=[]
      followingDetails.map((friend) => {
        const{_id,username,profilePicture} = friend
        followingsFriendList.push({_id,username,profilePicture})
      })
         res.status(200).json({followersFriendList,followingsFriendList})
      
    } catch (err) {
      console.log(err);
    }
  },

  //..................................................................................deleteComment
  deleteComment:async(req,res)=>{
      const{postId,commentId}=req.query

    try{
      const post=await Posts.updateOne({_id:postId},{$pull:{comments:commentId}})
       const childComment=await Comment.findOne({_id:commentId})
       console.log(childComment,'childddd...................................... ');
         if(childComment.parentcomment){
          await Comment.updateOne({_id:childComment.parentcomment},{$pull:{replayComment:commentId}})
         }
        const comment=await Comment.deleteOne({_id:commentId})
         res.status(200).json({deletedComment:true})
      
    }catch(err){
      console.log(err);
    }
  },

  //......................................................................editComment
  editComment:async (req, res) => {
    console.log(req.body);
     const {commentId} =req.query;
     try{

       const result = await Comment.updateOne({_id:commentId},{$set:{comment:req.body.comment}})
       res.status(200).json(result)
     }catch(err){
      res.status(500).json(err)
     }
  },

  //............................................................................getSuggestions
getSUggestions:async(req,res)=>{
   const userDetails=await User.findById(req.params.id)
  const otherUsers=await User.find({
    $and:[
      {
        _id:{$ne:userDetails._id},
      },
      {
        _id:{$nin:userDetails.followings}
      },
      {
        _id:{$nin:userDetails.followers}
      }
    ]
  }).sort('-createdAt').limit(5) 
  console.log(otherUsers,'otherUSer');
   res.status(200).json(otherUsers)
  },

  //................................................................................editPost
  editPost:async(req,res)=>{
    try{
      console.log(req.body,'bodyyy');
      const{message,postId}=req.body
      console.log(req.files);
      const data={}
     if(req.file){
      const file = req.file.path;
      var imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.url);
          }
        });
      })
     }
   message &&  message.trim() != "" ? data.caption = message : '';
    imageUrl && imageUrl.trim() !=""? data.imageName=imageUrl:'';
    const result= await Posts.updateOne({_id :postId},{$set:data})
    res.status(200).json(result)
    }catch(error){
      console.log(error);
    }
  },
  //...................................................follow User
  followUser:async(req,res)=>{
    try{
      console.log(req.params.id);
      if (req.body.userId !== req.params.id) {
        try {
          const user = await User.findOne({_id : req.params.id})
          const currentUser = await User.findById(req.body.userId)
          console.log(user,'user');
          if (!user.followers.includes(req.body.userId) ) {
            await user.updateOne({ $push: { followers: req.body.userId } })
            await currentUser.updateOne({ $push: { followings: req.params.id } }) 
            const newNotification =new Notification({
              senderName:currentUser,
              receiverId:user,
              message:'started following you'
            })
            newNotification.save()
            return res.status(200).json(user)
          } 
          else{
            res.status(403).json('you already follow this user')
          }
        } catch (err) {
          console.log(err);
          return res.status(403)
        }
      } else {
        return res.status(403).json('you cant follow yourself')
      }
    }catch(error){
      console.log(error);
    }
  },
  //..........................................................unfolowUser.......
  unfollowUser:async(req,res)=>{
    try{
      if (req.body.userId !== req.params.id) {
        try {
          const user = await User.findById(req.params.id)
          const currentUser = await User.findById(req.body.userId)
            await user.updateOne({ $pull: { followers: req.body.userId } })
            await currentUser.updateOne({ $pull: { followings: req.params.id } })
            const result = await Notification.updateOne({userId:req.params.id},{$pull:{followers:req.body.userId}})
            console.log(result,'resultt');
            
            return res.status(200).json('user has unfollow')
          
        } catch (err) {
          return res.status(403).json(err)
        }
      } else {
        return res.status(403).json('you cant unfollow yourself')
      }
    }catch(error){
      console.log(error);
    }

  },

  //............................................................likendUnlike
  likeAndUnlike:async (req,res) => {
      try {
        const post = await Posts.findById(req.params.id)
       
         const user = await User.findById(req.body.userId)
        if (!post.likes.includes(req.body.userId)) {
          await post.updateOne({ $push: { likes: req.body.userId } })
          if(req.body.userId != post.userId){
           const newNotification = new Notification({
            postId:post._id,
            senderName:user,
            receiverId:post.userId,
            message:'liked your post'
           })
           const notification =  await newNotification.save()
           console.log(notification,'notificationd');
           
          }
          res.status(200).json()
        } else {
          await post.updateOne({ $pull: { likes: req.body.userId } })
          res.status(200).json({UnlikedUser : user.username})
        }
      } catch (err) {
        res.status(500).json(err)
      }
  },
  //.............................................................getFriends
  getFriends:async(req,res) => {
    try{
      const user =await  User.findById(req.params.userId)
      const friends=await Promise.all(user.followings.map((friendId) => {
        return  User.findById(friendId)
      }))
      let friendList=[]
      friends.map((friend) => {
        const{_id, username, profilePicture } = friend
        friendList.push({_id, username, profilePicture})
      })
      res.status(200).json(friendList)
    }catch (err) {
      res.status(500).json(err)
    }
     

  },


  //.........................................................................ReportPost
  reportPost:async(req,res) => {
    const values={postId :req.params.postId, problem:req.body.problem , discription : req.body.discription}
    try{
      const reportedPost = await Report.findOne({postId:req.params.postId})
      if(reportedPost){
        await Report.updateOne({_id:reportedPost._id},{$push:{problem:req.body.problem}})
      }else{
        const post= await Posts.findById(req.params.postId)
          await Posts.updateOne({_id:req.params.postId},{$push:{problem:values.problem}})
          values.userId = post.userId
          const report =new Report(values)
          const savedReport =await report.save()
      }
      
      res.status(200).json('reported')

    }catch(err){
      console.log(err);
      res.status(500).json(err)
    }
  },
  //................................................removeFollower
  removeFollower:async (req,res) => {
    try{
      const currentUser =await User.findById(req.body.userId)
      const  followerUser =await User.findById(req.params.userId)
      await currentUser.updateOne({$pull:{followers:req.params.userId}})
      await followerUser.updateOne({$pull:{followings:req.body.userId}})
      res.status(200).json('removed')

    }catch(err){
      res.status(500).json(err)
    }
  } ,

  //..................................................getNotifications
  getNotifications: async (req, res) => {
    try {
     const userNotification = await Notification.find({receiverId:req.params.userId})
     console.log(userNotification,'userNotification');
     res.status(200).json(userNotification)
    }catch(err){
      res.status(500).json(err)
    }
  }
  


}

