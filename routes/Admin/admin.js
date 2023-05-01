const router = require('express').Router()
const adminController = require ('../../controllers/adminController')




router.post('/',adminController.adminLogin )

router.get('/allusers',adminController.getAllUsers)

router.put('/status',adminController.updateUserStatus)

router.get('/getposts/:state' , adminController.getPosts)

router.get('/getusers/:state', adminController.getUsers)

router.get('/getreports',adminController.getReports)

router.put('/conrtrolpost', adminController.controlPost)

module.exports =  router