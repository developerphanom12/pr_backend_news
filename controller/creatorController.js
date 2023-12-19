const { YourSpecificError } = require('../error/error');
const creatorService = require('../service/creatorService')
const bcrypt = require('bcrypt')
const emailservice = require('../template/sendingemail');
const { exist } = require('joi');



const registerCreatorHandler = async (req, res) => {
  try {
    const { creator_name, bio, email, phone_number, bank_number, ifcs_code, branch_name, name_at_bank, password } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required.' });
    }

    const imagePath = req.file.filename;

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('passs', password)
    await creatorService.registerCreator({
      creator_name,
      bio,
      image: imagePath,
      email,
      phone_number,
      bank_number,
      ifcs_code,
      branch_name,
      name_at_bank,
      password: hashedPassword
    });

    const responseMessage = 'Creator registration successful';
    const responseStatus = 201;

    res.status(responseStatus).json({
      message: responseMessage,
      status: responseStatus,
    });
  } catch (error) {
    console.error('Error registering creator:', error);
    res.status(500).json({ error: 'Failed to register creator' });
  }
};




const creatorlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    creatorService.logincreator(email, password, (err, result) => {
      if (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'An internal server error occurred' });
      }

      if (result.error) {
        return res.status(401).json({ error: result.error });
      }


      res.status(201).json({
        message: "creator login successfully",
        status: 201,
        data: result.data,
        token: result.token,
      });

    });
  } catch (error) {
    console.error('Error logging in creator:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};

const postadd = async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ error: 'Forbidden for regular users' });
    }

    const userId = req.user.id;
    const { creator_id, title, descriptions, category_id } = req.body;


    const userExists = await creatorService.checkcreatorexist(userId);

    if (!userExists) {
      return res.status(404).json({
        status: 404,
        error: 'User ID not found in user_register table',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'media  file is required.',
      });
    }
    const imagePath = req.file.filename;

    const universityData = await creatorService.addpost({
      creator_id: userId,
      media: imagePath,
      title,
      descriptions,
      category_id,
    });

    res.status(201).json({
      message: universityData,
      status: 201,
    });
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({ error: 'An error occurred while processing your request.' });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    console.error('Internal Server Error:', error);

    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
};



const aprooveCreator = async (req, res) => {
  const { userId, email, is_approved } = req.body;

  try {
    if (req.user.role !== 'admin') {
      throw {
        status: 403,
        error: 'Forbidden. Only admin can approve or reject applications.'
      };
    }

    if (is_approved !== 0 && is_approved !== 1) {
      throw {
        status: 400,
        error: 'Invalid is_approved value. It must be either 0 or 1.'
      };
    }

    creatorService.updatestatus(is_approved, userId, (error, result) => {
      if (error) {
        console.error('Error updating Creator status:', error);
        throw {
          status: 500,
          error: 'Failed to update Creator status.'
        };
      }

      console.log('Creator status updated successfully');

      if (is_approved === 1) {
        emailservice.sendRegistrationEmail(email);
      }

      res.status(200).json({
        status: 200,
        message: 'Creator status updated successfully'
      });
    });
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({ error: 'An error occurred while processing your request.' });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    console.error('Internal Server Error:', error);

    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
};

const getallpost = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query; 

    const offset = (page - 1) * pageSize;

    let userApplications;

    userApplications = await creatorService.getallpost(offset, pageSize);

    const totalCount = await creatorService.getTotalPostCount();

    const totalPages = Math.ceil(totalCount / pageSize);

    if (userApplications.length > 0) {
      res.status(200).json({
        message: "Posts fetched successfully",
        status: 200,
        data: {
          posts: userApplications, 
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalItems: totalCount, 
            totalPages,
          },
        },
      });
    } else {
      const responseMessage = 'No posts found.';
      res.status(404).json({
        message: responseMessage,
        status: 404,
      });
    }
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({
        status: 400,
        error: 'An error occurred while processing your request.',
      });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized access',
      });
    }

    console.error('Internal Server Error:', error);

    res.status(500).json({
      status: 500,
      error: 'An unexpected error occurred. Please try again later.',
    });
  }
};



const comment = async (req, res) => {
  const role = req.user.role;
  console.log("role", role);
  const userId = req.user.id;
  console.log('userid', userId);

  try {
    const userExists = await creatorService.checkUserExists(userId);

    if (!userExists) {
      return res.status(404).json({
        status: 404,
        error: 'User ID not found in user_register table',
      });
    }

    if (req.user.role !== 'user') {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden for regular users',
      });
    }

    const { post_id, comment } = req.body;

    const commentData = await creatorService.commentadd({
      post_id,
      user_id: userId,
      comment,
    });

    res.status(201).json({
      message: commentData,
      status: 201,
    });
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({
        status: 400,
        error: 'An error occurred while processing your request.'
      });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized access'
      });
    }

    console.error('Internal Server Error:', error);

    res.status(500).json({
      status: 500,
      error: 'An unexpected error occurred. Please try again later.'
    });
  }
};



const likePost = async (req, res) => {
  const role = req.user.role;
  console.log("role", role);
  const userId = req.user.id;
  console.log('userid', userId);

  try {
    const userExists = await creatorService.likespost(userId);

    if (!userExists) {
      return res.status(404).json({
        status: 404,
        error: 'User ID not found in user_register table',
      });
    }

    if (req.user.role !== 'user') {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden for regular users',
      });
    }

    const { post_id } = req.body;

    const commentData = await creatorService.Comment({
      post_id,
      user_id: userId,

    });

    res.status(201).json({
      message: commentData,
      status: 201,
    });
  } catch (error) {
    if (error instanceof YourSpecificError) {
      return res.status(400).json({
        status: 400,
        error: 'An error occurred while processing your request.'
      });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized access'
      });
    }

    console.error('Internal Server Error:', error);

    res.status(500).json({
      status: 500,
      error: 'An unexpected error occurred. Please try again later.'
    });
  }
};


module.exports = {
  registerCreatorHandler,
  creatorlogin,
  postadd,
  aprooveCreator,
  getallpost,
  comment,
  likePost
}
