const messageModel=require('../models/message')

module.exports={
    //...............................postMessage
    postMessage:async(req,res)=>{
        try{
         const message=await new messageModel(req.body).save()
         res.status(200).json(message)    
        }catch(error){
            res.status(500).json(error)
        }
    },
    //....................................getMessage
    getMessage:async(req,res)=>{
        try{
         const message=await messageModel.find({
            conversationId:req.params.conversationalId})
            res.status(200).json(message)
        }catch(err){
            res.status(500).json(err)
        }
    }
}