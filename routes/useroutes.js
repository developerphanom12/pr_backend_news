const  express = require('express')
const router = express.Router();
const userCreator =  require('../controller/userController');
const { validateUser } = require('../middleware/validation');
const { upload } = require('../multer/multer');
const authenticateToken = require('../auth/token');

router.post('/register',upload.single('image'), userCreator.userRegister)


router.post('/help',authenticateToken, userCreator.helpcontroller)

module.exports = router