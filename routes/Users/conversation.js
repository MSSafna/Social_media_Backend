const router = require('express').Router()
 const conversationalController=require('../../controllers/conversationalController')

//.............................postConversation
router.post('/',conversationalController.postConversation)

//................................getConversation
router.get('/:userId',conversationalController.getConversation)

router.get('/find/:firstUserId/:secondUserId',conversationalController.getConvTwoUsers)

module.exports=router