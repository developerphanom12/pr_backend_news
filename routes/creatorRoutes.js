
const  express = require('express')
const router = express.Router();
const creatorCOntroller = require('../controller/creatorController');
const { VALIDATECREATOR } = require('../middleware/validation');
const { upload } = require('../multer/multer');

router.post('/registercreator',upload.single('image'), VALIDATECREATOR,creatorCOntroller.registerCreatorHandler) 

router.post('/logincreator',creatorCOntroller.creatorlogin) 


module.exports = router;
