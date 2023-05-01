const mongoose = require('mongoose')
const ReportSchema = new mongoose.Schema({
    postId:{
    type: mongoose.Schema.Types.ObjectId,
      ref:'Posts'
    },
    problem:{
        type:Array
    },
   userId:{
      type:String
   },
   discription:{
    type: String
   },
  status:{
    type:Boolean,
    default:false
   }
},
    { timestamps: true }
);
module.exports = mongoose.model('Report', ReportSchema)
