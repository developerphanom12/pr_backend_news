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
    const { creator_id, title, descriptions, category_id ,media} = req.body;


    const userExists = await creatorService.checkid(userId);

    if (!userExists) {
      return res.status(404).json({
        status: 404,
        error: 'User ID not found in user_register table',
      });
    }

      if (!req.file) {
        return res.status(400).json({
          status:400,
          error: 'media  file is required.',
        });
      }
      const imagePath = req.file.filename;

    const universityData = await creatorService.addPost({
      creator_id: userId,
      media:imagePath,
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
        error: 'Forbidden. Only admin can approve or reject creator.'
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

const   getallpost = async (req, res) => {

  const { postTitle } = req.query;
  const userId = req.user.id
  const role = req.user.role 
console.log("useridrole", userId,role)
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    let getallPosts;

    if (postTitle) {
      getallPosts = await creatorService.searchKeyPosttitle(postTitle);

      if (getallPosts.length === 0) {
        return res.status(404).json({
          message: `No posts found with applicationStatus '${postTitle}'.`,
          status: 404,
        });
      }
    }
   
     if(role === 'creator'){
      getallPosts = await creatorService.getallpostbyId(userId,offset, pageSize);
      if (getallPosts.length === 0) {
        return res.status(404).json({
          message: 'No posts found.',
          status: 404,
        });
      }
    }

    const totalCount = await creatorService.getTotalPostCount(userId);
    const totalPages = Math.ceil(totalCount / pageSize);

    if (getallPosts.length > 0) {
      res.status(200).json({
        message: "Posts fetched successfully",
        status: 200,
        data: {
          posts: getallPosts,
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
      return res.status(400).json({ error: 'An error occurred while processing your request.' });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    console.error('Internal Server Error:', error);

    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
};
// 
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
        error: 'Forbidden for admin and creator only users can see this',
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
        error: 'Forbidden for admin and creator only users can see this',
      });
    }

    const { post_id } = req.body;

    const commentData = await creatorService.likeadd({
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




const getcommentbyPostid = async (req, res) => {
  try {
    const postid = req.params.id;
    console.log('sdfsdfsdf', postid);


    if (!postid) {
      return res.status(400).json({
        message: "please provide postid",
        status: 400
      })
    }
    let comments;
    comments = await creatorService.getallcommentbypostid(postid);

    if (comments.length > 0) {
      res.status(201).json({
        message: "Courses fetched successfully",
        status: 201,
        data: {
          commentData: comments
        }
      });
    } else {
      const responseMessage = 'No datafound for the provided ID.';
      res.status(404).json({
        message: responseMessage,
        status: 404
      });
    }
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


const addFollower = async (req, res) => {
  const role = req.user.role;
  console.log("role", role);
  const userId = req.user.id;
  console.log('userid', userId);

  try {
    // const userExists = await creatorService.checkUserExists(userId);

    // if (!userExists) {
    //   return res.status(404).json({
    //     status: 404,
    //     error: 'User ID not found in user_register table',
    //   });
    // }

    if (req.user.role !== 'user') {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden for admin and creator only users can see this',
      });
    }

    const { creator_id} = req.body;

    const commentData = await creatorService.Addfoloowr({
      creator_id,
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


const getFolloewer = async (req, res) => {
  try {
    const creatorId = req.user.id;
    console.log('sdfsdfsdf', creatorId);


    if (!creatorId) {
      return res.status(400).json({
        message: "please provide creatorId",
        status: 400
      })
    }
    let getFollowers;

    getFollowers = await creatorService.getallFollowr(creatorId);

    if (getFollowers.length > 0) {
      res.status(201).json({
        message: "followers fetched successfully",
        status: 201,
        data: {
          followers: getFollowers
        }
      });
    } else {
      const responseMessage = 'No datafound for the provided ID.';
      res.status(404).json({
        message: responseMessage,
        status: 404
      });
    }
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


const removeFollower = async (req, res) => {
  const role = req.user.role;
  console.log("role", role);
  const userId = req.user.id;
  console.log('userid', userId);

  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden for admin and creator only users can see this',
      });
    }

    const { creator_id } = req.body;

    const removedFollower = await creatorService.RemoveFollower({
      creator_id,
      user_id: userId,
    });

    if (removedFollower) {
      res.status(200).json({
        message: 'Unfollow successful',
        status: 200,
      });
    } else {
      res.status(404).json({
        status: 404,
        error: 'Follower not found',
      });
    }
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



const removelike = async (req, res) => {
  const role = req.user.role;
  console.log("role", role);
  const userId = req.user.id;
  console.log('userid', userId);

  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden for admin and creator only users can see this ',
      });
    }

    const { post_id } = req.body;

    const removedFollower = await creatorService.RemoveLIke({
      post_id,
      user_id: userId,
    });

    if (removedFollower) {
      res.status(200).json({
        message: 'Like Remove  successful',
        status: 200,
      });
    } else {
      res.status(404).json({
        status: 404,
        error: 'User not found',
      });
    }
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


const getpostwithoutath = async (req, res) => {

  const {creatorId } = req.query;
  
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    let getallPosts;

    if (creatorId) {
      getallPosts = await creatorService.getallpost(creatorId, offset, pageSize);
      if (getallPosts.length === 0) {
        return res.status(404).json({
          message: 'No posts found.',
          status: 404,
        });
      }
    }
     else {
    }
     
    const totalCount = await creatorService.gettotalbycategory(creatorId);
    const totalPages = Math.ceil(totalCount / pageSize);

    if (getallPosts.length > 0) {
      res.status(200).json({
        message: "Posts fetched successfully",
        status: 200,
        data: {
          posts: getallPosts,
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
      return res.status(400).json({ error: 'An error occurred while processing your request.' });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    console.error('Internal Server Error:', error);

    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
};




const deletePost = async (req, res) => {
  const { userId, is_deleted } = req.body;

  try {

    if (is_deleted !== 1) {
      throw {
        status: 400,
        error: 'Invalid is_deleted only value 1.'
      };
    }

    creatorService.updatepsotdlt(is_deleted, userId, (error, result) => {
      if (error) {
        console.error('Error delete post status:', error);
        throw {
          status: 500,
          error: 'Failed to   delete post.'
        };
      }

      console.log(' status updated successfully');

      res.status(200).json({
        status: 200,
        message: 'status updated successfully'
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




const getdataownclient = async (req, res) => {
  const userId = req.user.id
  try {
  if(!userId){
    res.status(404).json({status:404, message : "please provide userId"})
  }
      const clientdata = await creatorService.getdataown(userId);

      if (clientdata) {
        res.status(201).json({
          message: "Data fetched successfully",
          status: 201,
          data: clientdata,
        });
      } else {
        const responseMessage =
          "No data found for the provided ID.";
        res.status(404).json({
          message: responseMessage,
          status: 404,
        });
      }
    }
    catch (error) {
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
  



const removefolowerbycreator = async (req, res) => {
  const role = req.user.role;
  console.log("role", role);
  const userId = req.user.id;
  console.log('userid', userId);

  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden for admin and creator only users can see this',
      });
    }

    const { user_id } = req.body;

    const removedFollower = await creatorService.RemoveFollowerBycreator({
      user_id,
      creator_id :userId,
    });

    if (removedFollower) {
      res.status(200).json({
        message: 'Unfollow successful',
        status: 200,
      });
    } else {
      res.status(404).json({
        status: 404,
        error: 'Follower not found',
      });
    }
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



const homepost = async (req, res) => {
  try {
    let getallPosts;

    if (postTitle) {
      getallPosts = await creatorService.searchKeyPosttitle(postTitle);

      if (getallPosts.length === 0) {
        return res.status(404).json({
          message: `No posts found with applicationStatus '${postTitle}'.`,
          status: 404,
        });
      }
    }
   
     if(role === 'creator'){
      getallPosts = await creatorService.getallpostbyId(userId,offset, pageSize);
      if (getallPosts.length === 0) {
        return res.status(404).json({
          message: 'No posts found.',
          status: 404,
        });
      }
    }

    const totalCount = await creatorService.getTotalPostCount();
    const totalPages = Math.ceil(totalCount / pageSize);

    if (getallPosts.length > 0) {
      res.status(200).json({
        message: "Posts fetched successfully",
        status: 200,
        data: {
          posts: getallPosts,
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
      return res.status(400).json({ error: 'An error occurred while processing your request.' });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    console.error('Internal Server Error:', error);

    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
};




const gethomedata = async (req, res) => {
  try {
    
  const  getallPosts = await creatorService.gethomedata();
  const  getallEntertainment = await creatorService.getcatdata();
  const  getallbusisness = await creatorService.getbusisnessnews();


      if (getallPosts.length > 0) {
        res.status(200).json({
        message: "Posts fetched successfully",
        status: 200,
        data: {
        latest:  getallPosts,
        Entertainment : getallEntertainment,
        Busisness : getallbusisness
        },
        })
      }
      else {
      const responseMessage = 'No posts found.';
      res.status(404).json({
        message: responseMessage,
        status: 404,
      });
     }
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
    }


    

module.exports = {
  registerCreatorHandler,
  creatorlogin,
  postadd,
  aprooveCreator,
  getallpost,
  comment,
  likePost,
  getcommentbyPostid,
  addFollower,
  getFolloewer,
  removeFollower,
  removelike,
  getpostwithoutath,
  deletePost,
  getdataownclient,
  removefolowerbycreator,
  gethomedata
}

