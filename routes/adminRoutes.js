const  express = require('express')
const router = express.Router();
const admincontroller = require('../controller/adminController')

router.post('/adminregister', admincontroller.registerAdmin)

router.post('/adminlogin', admincontroller.loginadmin)

router.get('/getcateogery', admincontroller.allcategory)

module.exports = router;