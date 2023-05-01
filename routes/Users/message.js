const router = require('express').Router()
const Message=require('../../models/message')
const messageController=require('../../controllers/messageController')

router.post('/',messageController.postMessage)

router.get('/:conversationalId',messageController.getMessage)

module.exports=router