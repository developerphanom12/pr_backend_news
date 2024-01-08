const Joi = require('joi');
const { join } = require('path');


const REGISTERCREATOR = Joi.object({
    creator_name: Joi.string().required(),
    bio: Joi.string().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().required(),
    bank_number	: Joi.string(),
    ifcs_code  : Joi.string(),
    branch_name	:Joi.string(),
    name_at_bank : Joi.string(),
    password: Joi.string().required()
  });
  
  const VALIDATECREATOR = (req, res, next) => {
    const { error } = REGISTERCREATOR.validate(req.body);
  
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  

    next();
  };
  
  

const registeruser = Joi.object({
  name: Joi.string().required(),
  google_id : Joi.string()
});

const validateUser = (req, res, next) => {
  const { error } = registeruser.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }


  next();
};


const addcomment = Joi.object({
  post_id: Joi.number().required(),
  comment : Joi.string().required()
});

const validatecomment = (req, res, next) => {
  const { error } = addcomment.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }


  next();
};

const creatorlogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const validateLogin = (req, res, next) => {
  const { error } = creatorlogin.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }


  next();
};



const addlike = Joi.object({
  post_id: Joi.number().required(),
});

const Validatelike = (req, res, next) => {
  const { error } = addlike.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }


  next();
};

const addfollower = Joi.object({
  creator_id: Joi.number().required(),
});

const Validatefollower = (req, res, next) => {
  const { error } = addfollower.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }


  next();
};



const unfollow = Joi.object({
  creator_id: Joi.number().required(),
});

const validateUnfollow = (req, res, next) => {
  const { error } = unfollow.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }


  next();
};



const unlike = Joi.object({
  post_id: Joi.number().required(),
});

const validateUnlike= (req, res, next) => {
  const { error } = unlike.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }


  next();
};




const addpost = Joi.object({
  title: Joi.string().required(),
  descriptions: Joi.string().required(),
  category_id: Joi.number().required(),

});

const validatepost = (req, res, next) => {
  const { error } = addpost.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }


  next();
};



  module.exports ={
    VALIDATECREATOR,
    validateUser,
    validatecomment,
    validateLogin,
    Validatelike,
    Validatefollower,
    validateUnfollow,
    validateUnlike,
    validatepost
  }