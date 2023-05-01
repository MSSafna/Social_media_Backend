const conversationModel=require('../models/conversations')



module.exports={

    //........................................postconversation
    postConversation:async (req,res)=>{
        console.log('req.body' ,req.body );
        try{
            const conversation =await  conversationModel.findOne({
                members: { $in: [req.body.senderId && req.body.receiverId] }
              });
               if(conversation){
                    res.status(200).json(conversation)    
               }else{
                const newConversation=new conversationModel({
                    members:[req.body.senderId,req.body.receiverId]
                })
              const savedConversation =await newConversation .save()
              res.status(200).json(savedConversation)
               }

        }catch(error){
            res.status(500).json(error)
        }
    },
    //......................................getConversation
    getConversation:async(req,res)=>{
        try{
            const conversation=await conversationModel.find({
                members:{$in:[req.params.userId]}
            })
           res.status(200).json(conversation)
            
        }catch(error){
            res.status(500).json(error)
        }
    },

    //....................................getConvTwoUsers
    getConvTwoUsers:async(req,res) => {
        try{
        const conversation = await conversationModel.findOne({
            members:{$all : [req.params.firstUserId, req.params.secondUserId]}
        })
        res.status(200).json(conversation)
        }catch(err){
            res.status(500).json(err)
        }
    }
    
}