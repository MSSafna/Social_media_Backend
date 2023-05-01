
const mongoose = require('mongoose')
const replayCommentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required:true,
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments',
        required:true,
    },
    replayComment:{
        type:String,
        required: true
    },
    postedAt: {
        type: Date,
        default: Date.now
    },
},
    { timestamps: true }
);
module.exports = mongoose.model('replayComment', replayCommentSchema)
