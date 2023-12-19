const  express = require('express')
const router = express.Router();
const userCreator =  require('../controller/userController');
const { validateUser } = require('../middleware/validation');
const { upload } = require('../multer/multer');

router.post('/register',upload.single('image'), validateUser, userCreator.userRegister)



module.exports = router