
const  express = require('express')
const router = express.Router();
const creatorCOntroller = require('../controller/creatorController');
const { VALIDATECREATOR, validatecomment, validateLogin, Validatelike, Validatefollower } = require('../middleware/validation');
const { upload } = require('../multer/multer');
const authenticateToken = require('../auth/token');

router.post('/registercreator',upload.single('image'), VALIDATECREATOR,creatorCOntroller.registerCreatorHandler) 

router.post('/logincreator',validateLogin,creatorCOntroller.creatorlogin) 


router.get('/getallpost' ,authenticateToken, creatorCOntroller.getallpost)

router.post('/aproove' , authenticateToken, creatorCOntroller.aprooveCreator)

router.post('/commentadd' ,validatecomment, authenticateToken, creatorCOntroller.comment)

router.post('/likeadd',Validatelike, authenticateToken, creatorCOntroller.likePost)

router.get('/comment/:id',authenticateToken, creatorCOntroller.getcommentbyPostid)


router.post('/addfollower',Validatefollower, authenticateToken, creatorCOntroller.addFollower)

router.get('/checkfollower/:id',authenticateToken, creatorCOntroller.getFolloewer)

module.exports = router;
