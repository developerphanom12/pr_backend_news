
const  express = require('express')
const router = express.Router();
const creatorCOntroller = require('../controller/creatorController');
const { VALIDATECREATOR, validatecomment, validateLogin, Validatelike, Validatefollower, validateUnfollow, validateUnlike, validatepost, validateUnfollowbyCreator } = require('../middleware/validation');
const { upload } = require('../multer/multer');
const authenticateToken = require('../auth/token');
 

router.post('/registercreator',upload.single('image'), VALIDATECREATOR,creatorCOntroller.registerCreatorHandler) 

router.post('/logincreator',validateLogin,creatorCOntroller.creatorlogin) 

 
router.get('/getallpost' ,authenticateToken, creatorCOntroller.getallpost)

router.get('/getdataBycategory' , creatorCOntroller.getpostwithoutath)


router.post('/aproove' , authenticateToken, creatorCOntroller.aprooveCreator)

router.post('/commentadd' ,validatecomment, authenticateToken, creatorCOntroller.comment)

router.post('/likeadd',Validatelike, authenticateToken, creatorCOntroller.likePost)

router.get('/comment/:id', creatorCOntroller.getcommentbyPostid)

router.post('/addfollower',Validatefollower, authenticateToken, creatorCOntroller.addFollower)

router.get('/checkfollower',authenticateToken, creatorCOntroller.getFolloewer)

router.put('/unfollow',validateUnfollow,authenticateToken, creatorCOntroller.removeFollower)

router.put('/unlike',validateUnlike,authenticateToken, creatorCOntroller.removelike)

router.post('/addpost',upload.single('media'),validatepost, authenticateToken, creatorCOntroller.postadd)

router.post('/aproove' , authenticateToken, creatorCOntroller.aprooveCreator)

router.post('/deletepost' , authenticateToken, creatorCOntroller.deletePost)

router.get('/gedataown', authenticateToken, creatorCOntroller.getdataownclient)

router.post('/unfollowbyCretor',validateUnfollowbyCreator,authenticateToken, creatorCOntroller.removefolowerbycreator)

router.get('/getposthome' , creatorCOntroller.gethomedata)

router.get('/getby/:id', creatorCOntroller.geyByPostId)


module.exports = router;
